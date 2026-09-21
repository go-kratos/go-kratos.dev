package docsv3_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"reflect"
	"sync"
	"testing"
	"time"

	kratos "github.com/go-kratos/kratos/v3"
	kratoserrors "github.com/go-kratos/kratos/v3/errors"
	"github.com/go-kratos/kratos/v3/metadata"
	"github.com/go-kratos/kratos/v3/middleware"
	metadatamw "github.com/go-kratos/kratos/v3/middleware/metadata"
	"github.com/go-kratos/kratos/v3/middleware/recovery"
	"github.com/go-kratos/kratos/v3/transport"
	kratoshttp "github.com/go-kratos/kratos/v3/transport/http"
	"google.golang.org/protobuf/types/known/wrapperspb"
)

func TestHTTPServerSentEventStream(t *testing.T) {
	srv := kratoshttp.NewServer()
	srv.Route("/").GET("/events", func(ctx kratoshttp.Context) error {
		stream := kratoshttp.NewServerSentEventServerStream(ctx)
		if err := stream.Send(wrapperspb.String("ready")); err != nil {
			return err
		}
		return stream.Close(nil)
	})

	server := httptest.NewServer(srv)
	defer server.Close()
	client, err := kratoshttp.NewClient(context.Background(),
		kratoshttp.WithEndpoint(server.URL),
		kratoshttp.WithTimeout(time.Second),
	)
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()

	stream, err := client.ServerSentEvent(
		context.Background(),
		http.MethodGet,
		"/events",
		nil,
		kratoshttp.Accept("text/event-stream"),
		kratoshttp.ContentType("application/protojson"),
	)
	if err != nil {
		t.Fatal(err)
	}
	defer stream.CloseSend()

	var reply wrapperspb.StringValue
	if err := stream.Recv(&reply); err != nil {
		t.Fatal(err)
	}
	if reply.Value != "ready" {
		t.Fatalf("SSE value = %q, want ready", reply.Value)
	}
}

func TestHTTPWebSocketStream(t *testing.T) {
	srv := kratoshttp.NewServer()
	srv.Route("/").GET("/sync", func(ctx kratoshttp.Context) error {
		stream, err := kratoshttp.NewWebSocketServerStream(ctx)
		if err != nil {
			return err
		}
		var request wrapperspb.StringValue
		if err := stream.Recv(&request); err != nil {
			return stream.Close(err)
		}
		if err := stream.Send(wrapperspb.String("echo:" + request.Value)); err != nil {
			return stream.Close(err)
		}
		return stream.Close(nil)
	})

	server := httptest.NewServer(srv)
	defer server.Close()
	client, err := kratoshttp.NewClient(context.Background(),
		kratoshttp.WithEndpoint(server.URL),
		kratoshttp.WithTimeout(time.Second),
	)
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()

	stream, err := client.WebSocket(
		context.Background(),
		"/sync",
		kratoshttp.Accept("application/protojson"),
		kratoshttp.ContentType("application/protojson"),
	)
	if err != nil {
		t.Fatal(err)
	}
	defer stream.CloseSend()
	if err := stream.Send(wrapperspb.String("todo")); err != nil {
		t.Fatal(err)
	}

	var reply wrapperspb.StringValue
	if err := stream.Recv(&reply); err != nil {
		t.Fatal(err)
	}
	if reply.Value != "echo:todo" {
		t.Fatalf("WebSocket value = %q, want echo:todo", reply.Value)
	}
}

func TestMiddlewareExecutionOrder(t *testing.T) {
	var calls []string
	wrap := func(name string) middleware.Middleware {
		return func(next middleware.Handler) middleware.Handler {
			return func(ctx context.Context, request any) (any, error) {
				calls = append(calls, name+":before")
				reply, err := next(ctx, request)
				calls = append(calls, name+":after")
				return reply, err
			}
		}
	}
	handler := middleware.Chain(wrap("a"), wrap("b"))(func(context.Context, any) (any, error) {
		calls = append(calls, "handler")
		return "ok", nil
	})

	if _, err := handler(context.Background(), nil); err != nil {
		t.Fatal(err)
	}
	want := []string{"a:before", "b:before", "handler", "b:after", "a:after"}
	if !reflect.DeepEqual(calls, want) {
		t.Fatalf("middleware calls = %v, want %v", calls, want)
	}
}

func TestHTTPContextBindingAndErrorEncoding(t *testing.T) {
	srv := kratoshttp.NewServer(kratoshttp.Timeout(0))
	router := srv.Route("/")
	router.GET("/v1/users/{id}", func(ctx kratoshttp.Context) error {
		var request userRequest
		if err := ctx.BindVars(&request); err != nil {
			return err
		}
		return ctx.JSON(http.StatusOK, request)
	})
	router.GET("/fail", func(kratoshttp.Context) error {
		return kratoserrors.NotFound("USER_NOT_FOUND", "user does not exist")
	})

	recorder := httptest.NewRecorder()
	srv.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/v1/users/42", nil))
	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusOK)
	}
	var reply userRequest
	if err := json.Unmarshal(recorder.Body.Bytes(), &reply); err != nil {
		t.Fatal(err)
	}
	if reply.ID != "42" {
		t.Fatalf("bound id = %q, want 42", reply.ID)
	}

	recorder = httptest.NewRecorder()
	srv.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/fail", nil))
	if recorder.Code != http.StatusNotFound {
		t.Fatalf("error status = %d, want %d", recorder.Code, http.StatusNotFound)
	}
	var status kratoserrors.Status
	if err := json.Unmarshal(recorder.Body.Bytes(), &status); err != nil {
		t.Fatal(err)
	}
	if status.Reason != "USER_NOT_FOUND" {
		t.Fatalf("error reason = %q, want USER_NOT_FOUND", status.Reason)
	}
}

func TestRecoveryCustomHandlerResult(t *testing.T) {
	want := kratoserrors.ServiceUnavailable("DEPENDENCY", "try again later")
	handler := recovery.Recovery(
		recovery.WithHandler(func(context.Context, any, any) error { return want }),
	)(func(context.Context, any) (any, error) {
		panic("boom")
	})

	_, err := handler(context.Background(), "request")
	if !kratoserrors.Is(err, want) {
		t.Fatalf("recovery error = %v, want %v", err, want)
	}
}

type testHeader map[string][]string

func (h testHeader) Get(key string) string {
	values := h.Values(key)
	if len(values) == 0 {
		return ""
	}
	return values[0]
}
func (h testHeader) Set(key, value string) { h[key] = []string{value} }
func (h testHeader) Add(key, value string) { h[key] = append(h[key], value) }
func (h testHeader) Keys() []string {
	keys := make([]string, 0, len(h))
	for key := range h {
		keys = append(keys, key)
	}
	return keys
}
func (h testHeader) Values(key string) []string {
	for current, values := range h {
		if http.CanonicalHeaderKey(current) == http.CanonicalHeaderKey(key) {
			return values
		}
	}
	return nil
}

type testTransport struct{ request, reply testHeader }

func (*testTransport) Kind() transport.Kind              { return transport.KindHTTP }
func (*testTransport) Endpoint() string                  { return "http://example.test" }
func (*testTransport) Operation() string                 { return "/todo.v1.TodoService/GetTodo" }
func (t *testTransport) RequestHeader() transport.Header { return t.request }
func (t *testTransport) ReplyHeader() transport.Header   { return t.reply }

func TestMetadataDefaultPropagation(t *testing.T) {
	incoming := &testTransport{
		request: testHeader{
			"X-Md-Global-Request-Id": {"request-1"},
			"X-Md-Local-Caller":      {"gateway"},
			"Authorization":          {"secret"},
		},
		reply: testHeader{},
	}
	outgoing := &testTransport{request: testHeader{}, reply: testHeader{}}

	serverHandler := metadatamw.Server()(func(ctx context.Context, _ any) (any, error) {
		clientHandler := metadatamw.Client()(func(context.Context, any) (any, error) {
			return nil, nil
		})
		return clientHandler(transport.NewClientContext(ctx, outgoing), nil)
	})
	if _, err := serverHandler(transport.NewServerContext(context.Background(), incoming), nil); err != nil {
		t.Fatal(err)
	}
	if got := outgoing.request.Get("x-md-global-request-id"); got != "request-1" {
		t.Fatalf("global metadata = %q, want request-1", got)
	}
	if got := outgoing.request.Get("x-md-local-caller"); got != "" {
		t.Fatalf("local metadata unexpectedly propagated: %q", got)
	}
	if got := outgoing.request.Get("authorization"); got != "" {
		t.Fatalf("unselected header unexpectedly propagated: %q", got)
	}
}

type lifecycleServer struct {
	started chan struct{}
	stopped chan struct{}
	once    sync.Once
}

func (s *lifecycleServer) Start(context.Context) error {
	close(s.started)
	<-s.stopped
	return nil
}
func (s *lifecycleServer) Stop(context.Context) error {
	s.once.Do(func() { close(s.stopped) })
	return nil
}
func (*lifecycleServer) Endpoint() (*url.URL, error) {
	return url.Parse("test://127.0.0.1:9000")
}

func TestApplicationLifecycleAndContext(t *testing.T) {
	server := &lifecycleServer{started: make(chan struct{}), stopped: make(chan struct{})}
	var mu sync.Mutex
	var hooks []string
	record := func(name string) func(context.Context) error {
		return func(ctx context.Context) error {
			info, ok := kratos.FromContext(ctx)
			if !ok || info.Name() != "todo" {
				return kratoserrors.InternalServer("APP_INFO", "hook did not receive AppInfo")
			}
			mu.Lock()
			hooks = append(hooks, name)
			mu.Unlock()
			return nil
		}
	}
	app := kratos.New(
		kratos.ID("instance-1"),
		kratos.Name("todo"),
		kratos.Version("v3.0.0"),
		kratos.Server(server),
		kratos.StopTimeout(time.Second),
		kratos.BeforeStart(record("before-start")),
		kratos.AfterStart(record("after-start")),
		kratos.BeforeStop(record("before-stop")),
		kratos.AfterStop(record("after-stop")),
	)
	done := make(chan error, 1)
	go func() { done <- app.Run() }()

	select {
	case <-server.started:
	case <-time.After(time.Second):
		t.Fatal("server did not start")
	}
	for {
		mu.Lock()
		started := len(hooks) >= 2
		mu.Unlock()
		if started {
			break
		}
		select {
		case <-time.After(time.Millisecond):
		case err := <-done:
			t.Fatalf("application exited before stop: %v", err)
		}
	}
	if got := app.Endpoint(); !reflect.DeepEqual(got, []string{"test://127.0.0.1:9000"}) {
		t.Fatalf("endpoints = %v", got)
	}
	if err := app.Stop(); err != nil {
		t.Fatal(err)
	}
	if err := <-done; err != nil {
		t.Fatal(err)
	}
	mu.Lock()
	defer mu.Unlock()
	want := []string{"before-start", "after-start", "before-stop", "after-stop"}
	if !reflect.DeepEqual(hooks, want) {
		t.Fatalf("hooks = %v, want %v", hooks, want)
	}
}

func TestExplicitClientMetadataIsForwarded(t *testing.T) {
	outgoing := &testTransport{request: testHeader{}, reply: testHeader{}}
	ctx := metadata.AppendToClientContext(context.Background(), "request-id", "manual-1")
	ctx = transport.NewClientContext(ctx, outgoing)
	handler := metadatamw.Client()(func(context.Context, any) (any, error) { return nil, nil })
	if _, err := handler(ctx, nil); err != nil {
		t.Fatal(err)
	}
	if got := outgoing.request.Get("request-id"); got != "manual-1" {
		t.Fatalf("explicit client metadata = %q, want manual-1", got)
	}
}
