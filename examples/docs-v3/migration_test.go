package docsv3_test

import (
	"context"
	stderrors "errors"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"testing"

	kratosjwt "github.com/go-kratos/kratos/contrib/middleware/jwt/v3"
	kratos "github.com/go-kratos/kratos/v3"
	"github.com/go-kratos/kratos/v3/config"
	"github.com/go-kratos/kratos/v3/config/env"
	"github.com/go-kratos/kratos/v3/config/file"
	_ "github.com/go-kratos/kratos/v3/encoding/json"
	_ "github.com/go-kratos/kratos/v3/encoding/protojson"
	kratoserrors "github.com/go-kratos/kratos/v3/errors"
	"github.com/go-kratos/kratos/v3/log"
	"github.com/go-kratos/kratos/v3/middleware"
	"github.com/go-kratos/kratos/v3/middleware/circuitbreaker"
	"github.com/go-kratos/kratos/v3/middleware/validate"
	kratoshttp "github.com/go-kratos/kratos/v3/transport/http"
	jwtv5 "github.com/golang-jwt/jwt/v5"
)

type userRequest struct {
	ID string `json:"id"`
}

func TestConfigurationLoadScanAndGet(t *testing.T) {
	directory := t.TempDir()
	filename := filepath.Join(directory, "config.json")
	data := []byte(`{"service":{"name":"${SERVICE_NAME:todo}"},"port":8000}`)
	if err := os.WriteFile(filename, data, 0o600); err != nil {
		t.Fatal(err)
	}
	t.Setenv("KRATOS_SERVICE_NAME", "orders")

	c := config.New(config.WithSource(file.NewSource(directory), env.NewSource("KRATOS")))
	t.Cleanup(func() { _ = c.Close() })
	if err := c.Load(); err != nil {
		t.Fatal(err)
	}
	var bootstrap struct {
		Service struct {
			Name string `json:"name"`
		} `json:"service"`
	}
	if err := c.Scan(&bootstrap); err != nil {
		t.Fatal(err)
	}
	if bootstrap.Service.Name != "orders" {
		t.Fatalf("service name = %q, want orders", bootstrap.Service.Name)
	}
	port, err := config.Get[int](c, "port")
	if err != nil {
		t.Fatal(err)
	}
	if port != 8000 {
		t.Fatalf("port = %d, want 8000", port)
	}
}

func TestSlogApplicationConfiguration(t *testing.T) {
	logger := log.NewLogger(
		slog.NewJSONHandler(io.Discard, &slog.HandlerOptions{Level: slog.LevelInfo}),
		log.WithFilter(log.FilterKey("password")),
	).With(slog.String("service.name", "example"))

	app := kratos.New(kratos.Name("example"), kratos.Logger(logger))
	if app.Name() != "example" {
		t.Fatalf("app name = %q, want %q", app.Name(), "example")
	}
}

func TestHTTPPathAndErrors(t *testing.T) {
	path := kratoshttp.BuildPath("/v1/users/{id}", &userRequest{ID: "42"})
	if path != "/v1/users/42" {
		t.Fatalf("path = %q, want %q", path, "/v1/users/42")
	}

	err := kratoserrors.BadRequest("INVALID_ID", "user ID is invalid")
	if got := kratoserrors.Code(err); got != 400 {
		t.Fatalf("error code = %d, want 400", got)
	}
}

func TestErrorMetadataCauseAndExtraction(t *testing.T) {
	cause := stderrors.New("database unavailable")
	err := kratoserrors.InternalServer("DATABASE", "request failed").WithCause(cause).WithMetadata(map[string]string{"request_id": "abc"})

	if !stderrors.Is(err, cause) {
		t.Fatal("wrapped cause was not preserved")
	}
	if got := kratoserrors.FromError(err).Metadata["request_id"]; got != "abc" {
		t.Fatalf("metadata request_id = %q, want %q", got, "abc")
	}
	if got := kratoserrors.Reason(err); got != "DATABASE" {
		t.Fatalf("reason = %q, want %q", got, "DATABASE")
	}
}

func TestV3ErrorAndValidationAdditions(t *testing.T) {
	first := stderrors.New("first")
	second := stderrors.New("second")
	joined := kratoserrors.Join(first, second)
	if !stderrors.Is(joined, first) || !stderrors.Is(joined, second) {
		t.Fatal("joined error did not preserve both causes")
	}
	if !kratoserrors.IsTooManyRequests(kratoserrors.TooManyRequests("RATE_LIMITED", "try again later")) {
		t.Fatal("TooManyRequests helper did not map to HTTP 429")
	}

	validationCause := stderrors.New("invalid request")
	mw := validate.Validator(func(any) error { return validationCause })
	_, err := mw(func(context.Context, any) (any, error) {
		t.Fatal("handler ran after validation failed")
		return nil, nil
	})(context.Background(), struct{}{})
	if !kratoserrors.IsBadRequest(err) || !stderrors.Is(err, validationCause) {
		t.Fatalf("validation error = %v, want Bad Request retaining its cause", err)
	}
}

func TestCircuitBreakerMiddlewareConstruction(t *testing.T) {
	next := middleware.Handler(func(_ context.Context, _ any) (any, error) { return nil, nil })
	_ = circuitbreaker.Client()(next)
}

func TestJWTMiddlewareConstruction(t *testing.T) {
	next := middleware.Handler(func(ctx context.Context, _ any) (any, error) {
		_, _ = kratosjwt.FromContext(ctx)
		return nil, nil
	})
	_ = kratosjwt.Server(
		func(*jwtv5.Token) (any, error) { return []byte("key"), nil },
		kratosjwt.WithSigningMethod(jwtv5.SigningMethodHS256),
		kratosjwt.WithClaims(func() jwtv5.Claims { return &jwtv5.RegisteredClaims{} }),
	)(next)
}
