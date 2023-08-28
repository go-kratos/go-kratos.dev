---
id: config
title: 配置
description: Kratos 配置源可以指定多个，并且 config 会进行合并成 map[string]interface{}，然后通过 Scan 或者 Value 获取值内容
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
微服务或者说云原生应用的配置最佳实践是将配置文件和应用代码分开管理——不将配置文件放入代码仓库，也不打包进容器镜像，而是在服务运行时，把配置文件挂载进去或者直接从配置中心加载。Kratos的config组件就是用来帮助应用从各种配置源加载配置。

## 设计理念
### 1.支持多种配置源
Kratos定义了标准化的[Source和Watcher接口](https://github.com/go-kratos/kratos/blob/main/config/source.go)来适配各种配置源。

框架内置了[本地文件file](https://github.com/go-kratos/kratos/tree/main/config/file)和[环境变量env](https://github.com/go-kratos/kratos/tree/main/config/env)的实现。

另外，在[contrib/config](https://github.com/go-kratos/kratos/tree/main/contrib/config)下面，我们也提供了如下的配置中心的适配供使用：

* [apollo](https://github.com/go-kratos/kratos/tree/main/contrib/config/apollo)
* [consul](https://github.com/go-kratos/kratos/tree/main/contrib/config/consul)
* [etcd](https://github.com/go-kratos/kratos/tree/main/contrib/config/etcd)
* [kubernetes](https://github.com/go-kratos/kratos/tree/main/contrib/config/kubernetes)
* [nacos](https://github.com/go-kratos/kratos/tree/main/contrib/config/nacos)
* [polaris](https://github.com/go-kratos/kratos/tree/main/contrib/config/polaris)

如果上述的配置加载方式无法涵盖您的环境，您也可以通过实现接口来适配您自己的配置加载方式。

### 2.支持多种配置格式
配置组件复用了`encoding`中的反序列化逻辑作为配置解析使用。默认支持以下格式的解析：

* json
* proto
* xml
* yaml

框架将根据配置文件类型匹配对应的Codec，进行配置文件的解析。您也可以通过实现[Codec](https://github.com/go-kratos/kratos/blob/main/encoding/encoding.go#L10)并用`encoding.RegisterCodec`方法，将它注册进去，来解析其它格式的配置文件。

配置文件类型的提取，根据配置源具体实现不同而略有区别，内置的file是把文件后缀作为文件类型的，其它配置源插件的具体逻辑请参考对应的文档。

### 3.热更新
Kratos的config组件支持配置的热更新，您可以使用配置中心配合config的热更新功能，在服务不重新发布/不停机/不重启的情况下，在线更新服务的配置，修改服务的一些行为。

### 4.配置合并
在config组件中，所有的配置源中的配置（文件）将被逐个读出，分别解析成map，并合并到一个map中去。因此在加载完毕后，不需要再理会配置的文件名，不用文件名来进行查找，而是用内容中的结构来对配置的值进行索引即可。设计和编写配置文件时，请注意**各个配置文件中，根层级的key不要重复，否则可能会被覆盖**。

举例：

有如下两个配置文件：
```yaml
# 文件1
foo:
  baz: "2"
  biu: "example"
hello:
  a: b
```

```yaml
# 文件2
foo:
  bar: 3
  baz: aaaa
hey:
  good: bad
  qux: quux
```

`.Load`后，将被合并为如下的结构：
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
我们可以发现，配置文件的各层级将分别合并，在key冲突时会发生覆盖，而具体的覆盖顺序，会由配置源实现中的读取顺序决定，因此这里重新提醒一下，**各个配置文件中，根层级的key不要重复，也不要依赖这个覆盖的特性**，从根本上避免不同配置文件的内容互相覆盖造成问题。

在使用时，可以用`.Value("foo.bar")`直接获取某个字段的值，也可以用`.Scan`方法来将整个map读进某个结构体中，具体使用方式请看下文。

## 使用
### 1.初始化配置源
使用file，即从本地文件加载：
这里的path就是配置文件的路径，这里也可以填写一个目录名，这样会将整个目录中的所有文件进行解析加载，合并到同一个map中。
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

如果想用外部的配置中心，可以在[contrib/config](https://github.com/go-kratos/kratos/tree/main/contrib/config)里面找一个，以consul为例：
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

不同的配置源插件使用方式略有差别，您可以参考它们各自的文档或examples。

### 2.读取配置
首先要定义一个结构体用来解析字段，如果您使用的是kratos-layout创建的项目，可以参考后面讲解kratos-layout的部分，使用proto文件定义配置和生成struct。

我们这里演示的是手工定义结构，您需要在结构体上用json tag来定义您配置文件的字段。
```go
var v struct {
  Service struct {
    Name    string `json:"name"`
    Version string `json:"version"`
  } `json:"service"`
}
```

使用之前创建好的config实例，调用`.Scan`方法，读取配置文件的内容到结构体中，这种方式适用于完整获取整个配置文件的内容。
```go
// Unmarshal the config to struct
if err := c.Scan(&v); err != nil {
  panic(err)
}
fmt.Printf("config: %+v", v)
```

使用config实例的`.Value`方法，可以单独获取某个字段的内容。
```go
name, err := c.Value("service.name").String()
if err != nil {
  panic(err)
}
fmt.Printf("service: %s", name)
```

### 3.监听配置变更
通过`.Watch`方法，可以监听配置中某个字段的变更，在本地或远端的配置中心有配置文件变更时，执行回调函数进行自定义的处理
```go
if err := c.Watch("service.name", func(key string, value config.Value) {
  fmt.Printf("config changed: %s = %v\n", key, value)
  // 在这里写回调的逻辑
}); err != nil {
  log.Error(err)
}
```

### 4.读取环境变量
如果有配置需要从环境变量读取，请使用以下方式：

配置环境变量配置源env：
```go
c := config.New(
    config.WithSource(
        // 添加前缀为 KRATOS_ 的环境变量，不需要的话也可以设为空字符串
        env.NewSource("KRATOS_"),
        // 添加配置文件
        file.NewSource(path),
    ))
    
// 加载配置源：
if err := c.Load(); err != nil {
    log.Fatal(err)
}

// 获取环境变量 KRATOS_PORT 的值，这里用去掉前缀的名称进行读取
port, err := c.Value("PORT").String()
```

除了上面使用Value方法直接读的方式，也可以在配置文件内容里使用占位符来把环境变量中的值渲染进去：
```go
service:
  name: "kratos_app"
http:
  server:
    # 使用 service.name 的值
    name: "${service.name}"
    # 使用环境变量 PORT 替换，若不存在，使用默认值 8080
    port: "${PORT:8080}"
    # 使用环境变量 TIMEOUT 替换，无默认值
    timeout: "$TIMEOUT"
```

### 5.配置解析Decoder
Decoder用于将配置文件内容用特定的反序列化方法解析出来，[默认decoder](https://github.com/go-kratos/kratos/blob/main/config/options.go#L60)会根据文件的类型自动识别类型并解析，通常情况不需要自定义这个，您可以通过后文的实现Codec的方式来注册更多文件类型。

在初始化config时加入`WithDecoder`参数，可以将Decoder覆盖为自定义的逻辑。如下代码展示了配置自定义Decoder的方法，这里使用了yaml库解析所有配置文件，您可以使用这种方式来使用特定的配置文件解析方法，但更推荐使用后文的实现Codec的方式，能同时支持多种格式的解析。

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

### 6.配置处理Resolver
Resolver用于对解析完毕后的map结构进行再次处理，[默认resolver](https://github.com/go-kratos/kratos/blob/32272fe44156cf3d1fa5cd4dbbb9b5098c9c2a4f/config/options.go#L85)会对配置中的占位符进行填充。您可以通过在初始化config时加入`WithResolver`参数，来覆盖resolver的行为。

```go
c := config.New(
  config.WithSource(
    file.NewSource(flagconf),
  ),
  config.WithResolver(func (input map[string]interface{}) (err error)  {
    // 在这里对input进行处理即可
    // 您可能需要定义一个递归的函数，来处理嵌套的map结构
    return 
  }),
)
```

### 7.支持其它格式的配置文件
首先实现[Codec](https://github.com/go-kratos/kratos/blob/main/encoding/encoding.go#L10)，这里以yaml为例
   
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

然后注册该Codec
这里由于我们把注册代码`encoding.RegisterCodec(codec{})`写在了包的`init`方法中，所以在包被import的时候，将会运行这个`init`方法，也就是进行注册。所以您可以在代码入口（比如`main.go`）对它进行注册

```go
import _ "path/to/your/codec"
```
随后，config组件就能把上面代码中`const Name = "myyaml"`这部分作为格式类型名，调用该Codec解析这个文件。


## kratos-layout
### 理念
#### 1.项目结构
layout中涉及到配置文件有以下部分，简单介绍一下它们的作用

* [cmd/server/main.go](https://github.com/go-kratos/kratos-layout/blob/main/cmd/server/main.go) 这个是服务的入口，我们默认使用了内置的config/file组件从本地文件系统读取配置文件，默认会读取相对路径`configs`目录，您可以修改这个文件里`config.New()`参数中使用的配置源，从其它配置源（比如配置中心）进行加载配置。配置在这里将被加载到`conf.Bootstrap`结构体中，这个结构体的内容可以通过依赖注入，注入到服务内部的其它层，比如server或data，这样各层就能读取到各自需要的配置，完成自己的初始化。
* [configs/config.yaml](https://github.com/go-kratos/kratos-layout/blob/main/configs/config.yaml) 这是一个示例配置文件，configs目录的内容通常不参与服务的生产环境运行，您可以用它来进行本地开发时的配置文件的加载，方便应用能本地能跑起来调试，**不要将生产环境的配置放在这里。**
* [internal/conf](https://github.com/go-kratos/kratos-layout/tree/main/internal/conf) 在这里放配置文件的结构定义，我们在这里使用`.proto`文件来进行配置定义，然后通过在根目录执行`make config`，就可以将对应`.pb.go`文件生成到相同目录下供使用。在初始状态下，这个`conf.proto`所定义的结构，就是`configs/config.yaml`的结构，请保持两者一致。
* [make config](https://github.com/go-kratos/kratos-layout/blob/main/Makefile) Makefile中的这个指令，用于生成`.proto`定义的配置对应的`.pb.go`文件（就是调了一下protoc），要记得每次修改定义后，一定要执行这个指令来重新生成go文件

#### 2.配置生成命令
我们已经把根据proto生成结构体的指令预置在Makefile里面了，通过在项目根目录下执行`make config`即可生成。它实际上是调用了`protoc`工具，扫描internal目录下的proto文件进行生成。

#### 3.使用Protobuf定义配置
正如前文所说，我们可以在代码中直接用struct来定义配置结构进行解析。但您可能会发现，我们的最佳实践项目模板kratos-layout中采用了Protobuf来定义配置文件的结构。通过Protobuf定义，我们可以同时支持多种格式如`json`、`xml`或者`yaml`等多种配置格式统一解析，这样在读配置时会变得非常方便。

layout中使用了如下的`.proto`文件定义配置文件的字段：

```protobuf
syntax = "proto3";
package kratos.api;

option go_package = "github.com/go-kratos/kratos-layout/internal/conf;conf";

import "google/protobuf/duration.proto";

message Bootstrap {
  Server server = 1;
}

message Server {
  message HTTP {
    string network = 1;
    string addr = 2;
    google.protobuf.Duration timeout = 3;
  }
  message GRPC {
    string network = 1;
    string addr = 2;
    google.protobuf.Duration timeout = 3;
  }
  HTTP http = 1;
  GRPC grpc = 2;
}
```
我们可以看出，Protobuf的定义结构清晰，并且可以指定字段的类型，这在后续的配置文件解析中可以起到校验的作用，保证加载配置文件的有效性。

在定义好结构后，我们需要用`protoc`工具来生成对应的`.pb.go`代码，也就是相应的Go struct和序列化反序列化代码，供我们使用。

### 使用
#### 1.定义
修改`internal/conf/config.proto`文件的内容，在这里使用Protobuf IDL定义你配置文件的结构。您也可以在这个目录下创建新的proto文件来定义额外的配置格式。

#### 2.生成
在项目根目录执行下面的命令即可生成用来解析配置文件的结构体：
```bash
make config
```
执行成功后，您应该能看到`config.pb.go`生成在`config.proto`文件的旁边，您就可以使用里面的结构体，比如`Bootstrap`来读取您的配置。

#### 3.使用
读取配置项、监听配置变更和其它高级用法等使用方面的内容，与前文介绍的一致，这里就不再赘述。

## 扩展阅读
* [config example](https://github.com/go-kratos/examples/tree/main/config) 样例代码
