---
id: overview
title: Overview
---
Kratos has a series of built-in middleware to deal with common purpose such as logging or metrics. You could also implement Middleware interface to develop your custom middleware to process common business such as the user authentication etc.

## Built-in Middleware
Their codes are located in `middleware` directory.

### logging
In `middleware/logging`, this middleware is for logging the request.

### metrics
In `middleware/metrics`, this middleware is for enabling metric.

### recovery
In `middleware/recovery`，, this middleware is for panic recovery.

### status
In `middleware/status`, this middleware is for transformation of gRPC error.

### tracing
In `middleware/tracing`, this middleware is for enabling trace.

### validate
In `middleware/validate`, this middleware is for parameter validation.

### 

## Usage
Register it with `ServerOption` in `NewGRPCServer` or `NewHTTPServer`.

For example:
```go
// http
// define opts
var opts = []http.ServerOption{
	http.Middleware(
		recovery.Recovery(),
		tracing.Server(),
		logging.Server(),
	),
}
// create server
http.NewServer(opts...)



//grpc
var opts = []grpc.ServerOption{
		grpc.Middleware(
			recovery.Recovery(),
			status.Server(),
			tracing.Server(),
			logging.Server(),
		),
	}
// create server
grpc.NewServer(opts...)

```


## Custom Middleware
Implement `Middleware` interface.

(TBD)

