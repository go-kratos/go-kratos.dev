---
id: config
title: Configuration
description: Kratos configuration supports multiple sources, and the config will be merged into map[string]interface{}, then you can get the value content through Scan or Value.
keywords:
  - Go 
  - Kratos
  - Toolkit
  - Framework
  - Microservices
  - Protobuf
  - gRPC
  - HTTP
---
The best practice for configuring microservices or cloud-native applications is to separate configuration files from application code - do not put configuration files in code repositories or package them into container images, but mount the configuration files or load them directly from the configuration center at runtime. Kratos' config component is used to help applications load configurations from various sources.

## Design Philosophy
### 1. Support for Multiple Configuration Sources
Kratos defines standardized [Source and Watcher interfaces](https://github.com/go-kratos/kratos/blob/main/config/source.go) to adapt to various configuration sources.

The framework comes with built-in implementations of [local file (file)](https://github.com/go-kratos/kratos/tree/main/config/file) and [environment variable (env)](https://github.com/go-kratos/kratos/tree/main/config/env).

In addition, in [contrib/config](https://github.com/go-kratos/kratos/tree/main/contrib/config), we also provide adapters for the following configuration centers:

* [Apollo](https://github.com/go-kratos/kratos/tree/main/contrib/config/apollo)
* [Consul](https://github.com/go-kratos/kratos/tree/main/contrib/config/consul)
* [Etcd](https://github.com/go-kratos/kratos/tree/main/contrib/config/etcd)
* [Kubernetes](https://github.com/go-kratos/kratos/tree/main/contrib/config/kubernetes)
* [Nacos](https://github.com/go-kratos/kratos/tree/main/contrib/config/nacos)
* [Polaris](https://github.com/go-kratos/kratos/tree/main/contrib/config/polaris)

If the above configuration loading methods do not cover your environment, you can also implement the interface to adapt your own configuration loading method.

### 2. Support for Multiple Configuration Formats
The config component reuses the deserialization logic in `encoding` as the configuration parsing. It supports the following formats by default:

* JSON
* Protobuf
* XML
* YAML

The framework will parse the configuration file based on its type by matching the corresponding codec. You can also implement [Codec](https://github.com/go-kratos/kratos/blob/main/encoding/encoding.go#L10) and register it with the `encoding.RegisterCodec` method to parse other formats of configuration files.

The extraction of configuration file types varies slightly depending on the specific implementation of the configuration source. The built-in file source uses the file extension as the file type. Please refer to the documentation of the other configuration source plugins for their specific logic.

### 3. Hot Reloading
Kratos' config component supports hot reloading of configurations. You can use the configuration center to update the configuration of a service online without re-deploying, stopping, or restarting the service, and modify some behaviors of the service.

### 4. Configuration Merge
In the config component, the configurations (files) from all configuration sources will be read one by one, parsed into maps, and merged into one map. Therefore, after loading, you don't need to consider the file names or search for configurations by file names. Instead, you can use the structure of the contents to index the values of the configurations. When designing and writing configuration files, please note that **the root-level keys in different configuration files should not be duplicated, otherwise they may be overwritten**.

For example, if we have the following two configuration files:
```yaml
# File 1
foo:
  baz: "2"
  biu: "example"
hello:
  a: b
```

```yaml
# File 2
foo:
  bar: 3
  baz: aaaa
hey:
  good: bad
  qux: quux
```

After calling `.Load`, they will be merged into the following structure:
```json
{
  "foo": {
    "baz": "aaaa",
    "bar": 3,
    "biu": "example"
  },
  "hey": {
    "good": "bad",
    "qux": "quux"
  },
  "hello": {
    "a": "b"
  }
}
```
As we can see, the configurations from different files are merged separately, and when there is a key conflict, the values will be overwritten. The specific order of overwriting will be determined by the read order in the configuration source implementation. Therefore, I would like to remind you again that **the root-level keys in different configuration files should not be duplicated, and do not rely on this overwrite feature** to avoid problems caused by the overlapping of contents in different configuration files.

When using the configuration, you can use `.Value("foo.bar")` to directly get the value of a specific field, or use the `.Scan` method to read the entire map into a specific structure. Please refer to the following sections for specific usage.

## Usage
### 1. Initialize Configuration Sources
Use file, which loads from a local file:
Here, the `path` is the path to the configuration file. You can also specify a directory name, and all files in the directory will be parsed and loaded into the same map.
```go
import (
    "github.com/go-kratos/kratos/v2/config"
    "github.com/go-kratos/kratos/v2/config/file"
)

path := "configs/config.yaml"
c := config.New(
    config.WithSource(
        file.NewSource(path),
    )
）
```

If you want to use an external configuration center, you can find one in [contrib/config](https://github.com/go-kratos/kratos/tree/main/contrib/config). Taking Consul as an example:
```go
import (
	"github.com/go-kratos/kratos/contrib/config/consul/v2"
	"github.com/hashicorp/consul/api"
)

consulClient, err := api.NewClient(&api.Config{
  Address: "127.0.0.1:8500",
})
if err != nil {
  panic(err)
}
cs, err := consul.New(consulClient, consul.WithPath("app/cart/configs/"))
if err != nil {
  panic(err)
}
c := config.New(config.WithSource(cs))
```

Different configuration source plugins have slightly different usage methods. You can refer to their respective documentation or examples.

### 2. Read Configuration
First, define a structure to parse the fields of the configuration file. If you are using a project created with kratos-layout, you can refer to the section on kratos-layout below, which uses a `.proto` file to define the configuration and generate a struct.

Here, we demonstrate manually defining the structure. You need to use JSON tags to define the fields in your configuration file.
```go
var v struct {
  Service struct {
    Name    string `json:"name"`
    Version string `json:"version"`
  } `json:"service"`
}
```

Using the initialized config instance, call the `.Scan` method to read the configuration file into the structure. This method is suitable for obtaining the entire content of the configuration file.
```go
// Unmarshal the config to struct
if err := c.Scan(&v); err != nil {
  panic(err)
}
fmt.Printf("config: %+v", v)
```

You can use the `.Value` method of the config instance to get the content of a specific field.
```go
name, err := c.Value("service.name").String()
if err != nil {
  panic(err)
}
fmt.Printf("service: %s", name)
```

### 3. Watch Configuration Changes
You can use the `.Watch` method to listen for changes to a specific field in the configuration. When there are configuration file changes in the local or remote configuration center, the callback function will be executed for custom processing.
```go
if err := c.Watch("service.name", func(key string, value config.Value) {
  fmt.Printf("config changed: %s = %v\n", key, value)
  // Write your callback logic here
}); err != nil {
  log.Error(err)
}
```

### 4. Read Environment Variables
If there are configurations that need to be read from environment variables, please use the following method:

Configure the environment variable source `env`:
```go
c := config.New(
    config.WithSource(
        // Add environment variables with the prefix KRATOS_, or set it to an empty string if not needed
        env.NewSource("KRATOS_"),
        // Add configuration files
        file.NewSource(path),
    ))
    
// Load configuration sources:
if err := c.Load(); err != nil {
    log.Fatal(err)
}

// Get the value of environment variable KRATOS_PORT, here we read it using the name without the prefix
port, err := c.Value("PORT").String()
```

In addition to using the `Value` method mentioned above to read directly, you can also use placeholders in the configuration file to render the values from environment variables:
```go
service:
  name: "kratos_app"
http:
  server:
    # Use the value of service.name
    name: "${service.name}"
    # Replace with the environment variable PORT, if it does not exist, use the default value 8080
    port: "${PORT:8080}"
    # Replace with the environment variable TIMEOUT, no default value
    timeout: "$TIMEOUT"
```

### 5. Configure the Decoder
The Decoder is used to parse the content of the configuration file using a specific deserialization method. By default, the [default decoder](https://github.com/go-kratos/kratos/blob/main/config/options.go#L60) automatically recognizes and parses the type of the file based on its type. In general, you do not need to customize this. You can register more file types by implementing the Codec as described in the following section.

You can override the Decoder behavior by adding the `WithDecoder` parameter when initializing the config. The following code shows how to configure a custom Decoder. Here, we use the `yaml` library to parse all configuration files. You can use this method to specify a specific configuration file parsing method, but it is recommended to implement the Codec as described in the following section to support multiple formats of parsing at the same time.

```go
import "gopkg.in/yaml.v2"

c := config.New(
  config.WithSource(
    file.NewSource(flagconf),
  ),
  config.WithDecoder(func(kv *config.KeyValue, v map[string]interface{}) error {
    return yaml.Unmarshal(kv.Value, v)
  }),
)
```

### 6. Configure the Resolver
The Resolver is used to further process the parsed map structure. The [default resolver](https://github.com/go-kratos/kratos/blob/32272fe44156cf3d1fa5cd4dbbb9b5098c9c2a4f/config/options.go#L85) fills in placeholders in the configuration. You can override the behavior of the resolver by adding the `WithResolver` parameter when initializing the config.

```go
c := config.New(
  config.WithSource(
    file.NewSource(flagconf),
  ),
  config.WithResolver(func (input map[string]interface{}) (err error)  {
    // Process the input here
    // You may need to define a recursive function to process nested map structures
    return 
  }),
)
```

### 7. Support for Other Configuration File Formats
First, implement the [Codec](https://github.com/go-kratos/kratos/blob/main/encoding/encoding.go#L10). Here, we take YAML as an example.

```go
import (
	"github.com/go-kratos/kratos/v2/encoding"
	"gopkg.in/yaml.v3"
)

const Name = "myyaml"

func init() {
	encoding.RegisterCodec(codec{})
}

// codec is a Codec implementation with yaml.
type codec struct{}

func (codec) Marshal(v interface{}) ([]byte, error) {
	return yaml.Marshal(v)
}

func (codec) Unmarshal(data []byte, v interface{}) error {
	return yaml.Unmarshal(data, v)
}

func (codec) Name() string {
	return Name
}
``` 

Then, register the Codec. Since we put the registration code `encoding.RegisterCodec(codec{})` in the `init` function of the package, it will be executed when the package is imported, which means it will be registered. Therefore, you can register it in the entry point of the code (e.g., `main.go`).

```go
import _ "path/to/your/codec"
```

After that, the config component will use the `const Name = "myyaml"` in the above code as the format type name and call the Codec to parse the file. 


## kratos-layout
### Philosophy
#### 1. Project Structure
The layout includes the following parts related to configuration files, and we will briefly introduce their roles:

* [cmd/server/main.go](https://github.com/go-kratos/kratos-layout/blob/main/cmd/server/main.go): This is the entry point of the service. We use the built-in config/file component to load the configuration file from the local file system by default. It will read the `configs` directory by default. You can modify the configuration source used in the `config.New()` parameter to load configurations from other sources (such as a configuration center). The configurations will be loaded into the `conf.Bootstrap` struct, and the content of this struct can be injected into other layers of the service, such as server or data, so that each layer can read the configurations it needs and complete its initialization.

* [configs/config.yaml](https://github.com/go-kratos/kratos-layout/blob/main/configs/config.yaml): This is an example configuration file. The content in the `configs` directory is usually not used in the production environment of the service. You can use it to load configuration files for local development, so that the application can run locally for debugging. **Do not put production environment configurations here.**

* [internal/conf](https://github.com/go-kratos/kratos-layout/tree/main/internal/conf): Here, you put the structure definitions of the configuration files. We use `.proto` files to define the configurations here, and then use `make config` in the root directory to generate the corresponding `.pb.go` files in the same directory for use. In the initial state, the structure defined in the `conf.proto` is the same as the structure of `configs/config.yaml`, so please keep them consistent.

* [make config](https://github.com/go-kratos/kratos-layout/blob/main/Makefile): This command in the Makefile is used to generate the `.pb.go` files corresponding to the `.proto` definitions (which actually calls protoc) in the internal directory. Remember to execute this command every time you modify the definitions to regenerate the go files.

#### 2. Configuration Generation Command
We have already included the command for generating structs based on proto in the Makefile. You can generate the files by executing `make config` in the project root directory. It actually calls the `protoc` tool to scan the proto files in the internal directory and generate the corresponding `.pb.go` files.

#### 3. Usage
The usage of reading configuration items, listening for configuration changes, and other advanced usages are the same as mentioned above, so we will not repeat them here.

## Further Reading
* [config example](https://github.com/go-kratos/examples/tree/main/config): Example code

