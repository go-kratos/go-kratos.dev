"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[5789],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return g}});var o=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,o,i=function(e,t){if(null==e)return{};var n,o,i={},r=Object.keys(e);for(o=0;o<r.length;o++)n=r[o],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(o=0;o<r.length;o++)n=r[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=o.createContext({}),s=function(e){var t=o.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},u=function(e){var t=s(e.components);return o.createElement(c.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},f=o.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,c=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),f=s(n),g=i,h=f["".concat(c,".").concat(g)]||f[g]||p[g]||r;return n?o.createElement(h,a(a({ref:t},u),{},{components:n})):o.createElement(h,a({ref:t},u))}));function g(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,a=new Array(r);a[0]=f;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:i,a[1]=l;for(var s=2;s<r;s++)a[s]=n[s];return o.createElement.apply(null,a)}return o.createElement.apply(null,n)}f.displayName="MDXCreateElement"},3366:function(e,t,n){n.r(t),n.d(t,{assets:function(){return c},contentTitle:function(){return a},default:function(){return p},frontMatter:function(){return r},metadata:function(){return l},toc:function(){return s}});var o=n(3117),i=(n(7294),n(3905));const r={id:"config",title:"Configuration",description:"Kratos configuration supports multiple sources, and the config will be merged into map[string]interface{}, then you can get the value content through Scan or Value.",keywords:["Go","Kratos","Toolkit","Framework","Microservices","Protobuf","gRPC","HTTP"]},a=void 0,l={unversionedId:"component/config",id:"component/config",title:"Configuration",description:"Kratos configuration supports multiple sources, and the config will be merged into map[string]interface{}, then you can get the value content through Scan or Value.",source:"@site/i18n/en/docusaurus-plugin-content-docs/current/component/02-config.md",sourceDirName:"component",slug:"/component/config",permalink:"/en/docs/component/config",draft:!1,editUrl:"https://github.com/go-kratos/go-kratos.dev/edit/main/i18n/en/docusaurus-plugin-content-docs/current/component/02-config.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{id:"config",title:"Configuration",description:"Kratos configuration supports multiple sources, and the config will be merged into map[string]interface{}, then you can get the value content through Scan or Value.",keywords:["Go","Kratos","Toolkit","Framework","Microservices","Protobuf","gRPC","HTTP"]},sidebar:"docs",previous:{title:"API Definition",permalink:"/en/docs/component/api"},next:{title:"Encoding",permalink:"/en/docs/component/encoding"}},c={},s=[{value:"Design Philosophy",id:"design-philosophy",level:2},{value:"1. Support for Multiple Configuration Sources",id:"1-support-for-multiple-configuration-sources",level:3},{value:"2. Support for Multiple Configuration Formats",id:"2-support-for-multiple-configuration-formats",level:3},{value:"3. Hot Reloading",id:"3-hot-reloading",level:3},{value:"4. Configuration Merge",id:"4-configuration-merge",level:3},{value:"Usage",id:"usage",level:2},{value:"1. Initialize Configuration Sources",id:"1-initialize-configuration-sources",level:3},{value:"2. Read Configuration",id:"2-read-configuration",level:3},{value:"3. Watch Configuration Changes",id:"3-watch-configuration-changes",level:3},{value:"4. Read Environment Variables",id:"4-read-environment-variables",level:3},{value:"5. Configure the Decoder",id:"5-configure-the-decoder",level:3},{value:"6. Configure the Resolver",id:"6-configure-the-resolver",level:3},{value:"7. Support for Other Configuration File Formats",id:"7-support-for-other-configuration-file-formats",level:3},{value:"kratos-layout",id:"kratos-layout",level:2},{value:"Philosophy",id:"philosophy",level:3},{value:"1. Project Structure",id:"1-project-structure",level:4},{value:"2. Configuration Generation Command",id:"2-configuration-generation-command",level:4},{value:"3. Usage",id:"3-usage",level:4},{value:"Further Reading",id:"further-reading",level:2}],u={toc:s};function p(e){let{components:t,...n}=e;return(0,i.kt)("wrapper",(0,o.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"The best practice for configuring microservices or cloud-native applications is to separate configuration files from application code - do not put configuration files in code repositories or package them into container images, but mount the configuration files or load them directly from the configuration center at runtime. Kratos' config component is used to help applications load configurations from various sources."),(0,i.kt)("h2",{id:"design-philosophy"},"Design Philosophy"),(0,i.kt)("h3",{id:"1-support-for-multiple-configuration-sources"},"1. Support for Multiple Configuration Sources"),(0,i.kt)("p",null,"Kratos defines standardized ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/go-kratos/kratos/blob/main/config/source.go"},"Source and Watcher interfaces")," to adapt to various configuration sources."),(0,i.kt)("p",null,"The framework comes with built-in implementations of ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/go-kratos/kratos/tree/main/config/file"},"local file (file)")," and ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/go-kratos/kratos/tree/main/config/env"},"environment variable (env)"),"."),(0,i.kt)("p",null,"In addition, in ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/go-kratos/kratos/tree/main/contrib/config"},"contrib/config"),", we also provide adapters for the following configuration centers:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://github.com/go-kratos/kratos/tree/main/contrib/config/apollo"},"Apollo")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://github.com/go-kratos/kratos/tree/main/contrib/config/consul"},"Consul")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://github.com/go-kratos/kratos/tree/main/contrib/config/etcd"},"Etcd")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://github.com/go-kratos/kratos/tree/main/contrib/config/kubernetes"},"Kubernetes")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://github.com/go-kratos/kratos/tree/main/contrib/config/nacos"},"Nacos")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://github.com/go-kratos/kratos/tree/main/contrib/config/polaris"},"Polaris"))),(0,i.kt)("p",null,"If the above configuration loading methods do not cover your environment, you can also implement the interface to adapt your own configuration loading method."),(0,i.kt)("h3",{id:"2-support-for-multiple-configuration-formats"},"2. Support for Multiple Configuration Formats"),(0,i.kt)("p",null,"The config component reuses the deserialization logic in ",(0,i.kt)("inlineCode",{parentName:"p"},"encoding")," as the configuration parsing. It supports the following formats by default:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"JSON"),(0,i.kt)("li",{parentName:"ul"},"Protobuf"),(0,i.kt)("li",{parentName:"ul"},"XML"),(0,i.kt)("li",{parentName:"ul"},"YAML")),(0,i.kt)("p",null,"The framework will parse the configuration file based on its type by matching the corresponding codec. You can also implement ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/go-kratos/kratos/blob/main/encoding/encoding.go#L10"},"Codec")," and register it with the ",(0,i.kt)("inlineCode",{parentName:"p"},"encoding.RegisterCodec")," method to parse other formats of configuration files."),(0,i.kt)("p",null,"The extraction of configuration file types varies slightly depending on the specific implementation of the configuration source. The built-in file source uses the file extension as the file type. Please refer to the documentation of the other configuration source plugins for their specific logic."),(0,i.kt)("h3",{id:"3-hot-reloading"},"3. Hot Reloading"),(0,i.kt)("p",null,"Kratos' config component supports hot reloading of configurations. You can use the configuration center to update the configuration of a service online without re-deploying, stopping, or restarting the service, and modify some behaviors of the service."),(0,i.kt)("h3",{id:"4-configuration-merge"},"4. Configuration Merge"),(0,i.kt)("p",null,"In the config component, the configurations (files) from all configuration sources will be read one by one, parsed into maps, and merged into one map. Therefore, after loading, you don't need to consider the file names or search for configurations by file names. Instead, you can use the structure of the contents to index the values of the configurations. When designing and writing configuration files, please note that ",(0,i.kt)("strong",{parentName:"p"},"the root-level keys in different configuration files should not be duplicated, otherwise they may be overwritten"),"."),(0,i.kt)("p",null,"For example, if we have the following two configuration files:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-yaml"},'# File 1\nfoo:\n  baz: "2"\n  biu: "example"\nhello:\n  a: b\n')),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-yaml"},"# File 2\nfoo:\n  bar: 3\n  baz: aaaa\nhey:\n  good: bad\n  qux: quux\n")),(0,i.kt)("p",null,"After calling ",(0,i.kt)("inlineCode",{parentName:"p"},".Load"),", they will be merged into the following structure:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "foo": {\n    "baz": "aaaa",\n    "bar": 3,\n    "biu": "example"\n  },\n  "hey": {\n    "good": "bad",\n    "qux": "quux"\n  },\n  "hello": {\n    "a": "b"\n  }\n}\n')),(0,i.kt)("p",null,"As we can see, the configurations from different files are merged separately, and when there is a key conflict, the values will be overwritten. The specific order of overwriting will be determined by the read order in the configuration source implementation. Therefore, I would like to remind you again that ",(0,i.kt)("strong",{parentName:"p"},"the root-level keys in different configuration files should not be duplicated, and do not rely on this overwrite feature")," to avoid problems caused by the overlapping of contents in different configuration files."),(0,i.kt)("p",null,"When using the configuration, you can use ",(0,i.kt)("inlineCode",{parentName:"p"},'.Value("foo.bar")')," to directly get the value of a specific field, or use the ",(0,i.kt)("inlineCode",{parentName:"p"},".Scan")," method to read the entire map into a specific structure. Please refer to the following sections for specific usage."),(0,i.kt)("h2",{id:"usage"},"Usage"),(0,i.kt)("h3",{id:"1-initialize-configuration-sources"},"1. Initialize Configuration Sources"),(0,i.kt)("p",null,"Use file, which loads from a local file:\nHere, the ",(0,i.kt)("inlineCode",{parentName:"p"},"path")," is the path to the configuration file. You can also specify a directory name, and all files in the directory will be parsed and loaded into the same map."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},'import (\n    "github.com/go-kratos/kratos/v2/config"\n    "github.com/go-kratos/kratos/v2/config/file"\n)\n\npath := "configs/config.yaml"\nc := config.New(\n    config.WithSource(\n        file.NewSource(path),\n    ),\n)\n\n')),(0,i.kt)("p",null,"If you want to use an external configuration center, you can find one in ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/go-kratos/kratos/tree/main/contrib/config"},"contrib/config"),". Taking Consul as an example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},'import (\n    "github.com/go-kratos/kratos/contrib/config/consul/v2"\n    "github.com/hashicorp/consul/api"\n)\n\nconsulClient, err := api.NewClient(&api.Config{\n  Address: "127.0.0.1:8500",\n})\nif err != nil {\n  panic(err)\n}\ncs, err := consul.New(consulClient, consul.WithPath("app/cart/configs/"))\nif err != nil {\n  panic(err)\n}\nc := config.New(config.WithSource(cs))\n')),(0,i.kt)("p",null,"Different configuration source plugins have slightly different usage methods. You can refer to their respective documentation or examples."),(0,i.kt)("h3",{id:"2-read-configuration"},"2. Read Configuration"),(0,i.kt)("p",null,"First, define a structure to parse the fields of the configuration file. If you are using a project created with kratos-layout, you can refer to the section on kratos-layout below, which uses a ",(0,i.kt)("inlineCode",{parentName:"p"},".proto")," file to define the configuration and generate a struct."),(0,i.kt)("p",null,"Here, we demonstrate manually defining the structure. You need to use JSON tags to define the fields in your configuration file."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},'var v struct {\n  Service struct {\n    Name    string `json:"name"`\n    Version string `json:"version"`\n  } `json:"service"`\n}\n')),(0,i.kt)("p",null,"Using the initialized config instance, call the ",(0,i.kt)("inlineCode",{parentName:"p"},".Scan")," method to read the configuration file into the structure. This method is suitable for obtaining the entire content of the configuration file."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},'// Unmarshal the config to struct\nif err := c.Scan(&v); err != nil {\n  panic(err)\n}\nfmt.Printf("config: %+v", v)\n')),(0,i.kt)("p",null,"You can use the ",(0,i.kt)("inlineCode",{parentName:"p"},".Value")," method of the config instance to get the content of a specific field."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},'name, err := c.Value("service.name").String()\nif err != nil {\n  panic(err)\n}\nfmt.Printf("service: %s", name)\n')),(0,i.kt)("h3",{id:"3-watch-configuration-changes"},"3. Watch Configuration Changes"),(0,i.kt)("p",null,"You can use the ",(0,i.kt)("inlineCode",{parentName:"p"},".Watch")," method to listen for changes to a specific field in the configuration. When there are configuration file changes in the local or remote configuration center, the callback function will be executed for custom processing."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},'if err := c.Watch("service.name", func(key string, value config.Value) {\n  fmt.Printf("config changed: %s = %v\\n", key, value)\n  // Write your callback logic here\n}); err != nil {\n  log.Error(err)\n}\n')),(0,i.kt)("h3",{id:"4-read-environment-variables"},"4. Read Environment Variables"),(0,i.kt)("p",null,"If there are configurations that need to be read from environment variables, please use the following method:"),(0,i.kt)("p",null,"Configure the environment variable source ",(0,i.kt)("inlineCode",{parentName:"p"},"env"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},'c := config.New(\n    config.WithSource(\n        // Add environment variables with the prefix KRATOS_, or set it to an empty string if not needed\n        env.NewSource("KRATOS_"),\n        // Add configuration files\n        file.NewSource(path),\n    ))\n    \n// Load configuration sources:\nif err := c.Load(); err != nil {\n    log.Fatal(err)\n}\n\n// Get the value of environment variable KRATOS_PORT, here we read it using the name without the prefix\nport, err := c.Value("PORT").String()\n')),(0,i.kt)("p",null,"In addition to using the ",(0,i.kt)("inlineCode",{parentName:"p"},"Value")," method mentioned above to read directly, you can also use placeholders in the configuration file to render the values from environment variables:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},'service:\n  name: "kratos_app"\nhttp:\n  server:\n    # Use the value of service.name\n    name: "${service.name}"\n    # Replace with the environment variable PORT, if it does not exist, use the default value 8080\n    port: "${PORT:8080}"\n    # This format is not supported and will be treated as a regular string\n    timeout: "$TIMEOUT"\n')),(0,i.kt)("h3",{id:"5-configure-the-decoder"},"5. Configure the Decoder"),(0,i.kt)("p",null,"The Decoder is used to parse the content of the configuration file using a specific deserialization method. By default, the ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/go-kratos/kratos/blob/main/config/options.go#L60"},"default decoder")," automatically recognizes and parses the type of the file based on its type. In general, you do not need to customize this. You can register more file types by implementing the Codec as described in the following section."),(0,i.kt)("p",null,"You can override the Decoder behavior by adding the ",(0,i.kt)("inlineCode",{parentName:"p"},"WithDecoder")," parameter when initializing the config. The following code shows how to configure a custom Decoder. Here, we use the ",(0,i.kt)("inlineCode",{parentName:"p"},"yaml")," library to parse all configuration files. You can use this method to specify a specific configuration file parsing method, but it is recommended to implement the Codec as described in the following section to support multiple formats of parsing at the same time."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},'import "gopkg.in/yaml.v2"\n\nc := config.New(\n  config.WithSource(\n    file.NewSource(flagconf),\n  ),\n  config.WithDecoder(func(kv *config.KeyValue, v map[string]interface{}) error {\n    return yaml.Unmarshal(kv.Value, v)\n  }),\n)\n')),(0,i.kt)("h3",{id:"6-configure-the-resolver"},"6. Configure the Resolver"),(0,i.kt)("p",null,"The Resolver is used to further process the parsed map structure. The ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/go-kratos/kratos/blob/32272fe44156cf3d1fa5cd4dbbb9b5098c9c2a4f/config/options.go#L85"},"default resolver")," fills in placeholders in the configuration. You can override the behavior of the resolver by adding the ",(0,i.kt)("inlineCode",{parentName:"p"},"WithResolver")," parameter when initializing the config."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},"c := config.New(\n  config.WithSource(\n    file.NewSource(flagconf),\n  ),\n  config.WithResolver(func (input map[string]interface{}) (err error)  {\n    // Process the input here\n    // You may need to define a recursive function to process nested map structures\n    return \n  }),\n)\n")),(0,i.kt)("h3",{id:"7-support-for-other-configuration-file-formats"},"7. Support for Other Configuration File Formats"),(0,i.kt)("p",null,"First, implement the ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/go-kratos/kratos/blob/main/encoding/encoding.go#L10"},"Codec"),". Here, we take YAML as an example."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},'import (\n    "github.com/go-kratos/kratos/v2/encoding"\n    "gopkg.in/yaml.v3"\n)\n\nconst Name = "myyaml"\n\nfunc init() {\n    encoding.RegisterCodec(codec{})\n}\n\n// codec is a Codec implementation with yaml.\ntype codec struct{}\n\nfunc (codec) Marshal(v interface{}) ([]byte, error) {\n    return yaml.Marshal(v)\n}\n\nfunc (codec) Unmarshal(data []byte, v interface{}) error {\n    return yaml.Unmarshal(data, v)\n}\n\nfunc (codec) Name() string {\n    return Name\n}\n')),(0,i.kt)("p",null,"Then, register the Codec. Since we put the registration code ",(0,i.kt)("inlineCode",{parentName:"p"},"encoding.RegisterCodec(codec{})")," in the ",(0,i.kt)("inlineCode",{parentName:"p"},"init")," function of the package, it will be executed when the package is imported, which means it will be registered. Therefore, you can register it in the entry point of the code (e.g., ",(0,i.kt)("inlineCode",{parentName:"p"},"main.go"),")."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},'import _ "path/to/your/codec"\n')),(0,i.kt)("p",null,"After that, the config component will use the ",(0,i.kt)("inlineCode",{parentName:"p"},'const Name = "myyaml"')," in the above code as the format type name and call the Codec to parse the file. "),(0,i.kt)("h2",{id:"kratos-layout"},"kratos-layout"),(0,i.kt)("h3",{id:"philosophy"},"Philosophy"),(0,i.kt)("h4",{id:"1-project-structure"},"1. Project Structure"),(0,i.kt)("p",null,"The layout includes the following parts related to configuration files, and we will briefly introduce their roles:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"https://github.com/go-kratos/kratos-layout/blob/main/cmd/server/main.go"},"cmd/server/main.go"),": This is the entry point of the service. We use the built-in config/file component to load the configuration file from the local file system by default. It will read the ",(0,i.kt)("inlineCode",{parentName:"p"},"configs")," directory by default. You can modify the configuration source used in the ",(0,i.kt)("inlineCode",{parentName:"p"},"config.New()")," parameter to load configurations from other sources (such as a configuration center). The configurations will be loaded into the ",(0,i.kt)("inlineCode",{parentName:"p"},"conf.Bootstrap")," struct, and the content of this struct can be injected into other layers of the service, such as server or data, so that each layer can read the configurations it needs and complete its initialization.")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"https://github.com/go-kratos/kratos-layout/blob/main/configs/config.yaml"},"configs/config.yaml"),": This is an example configuration file. The content in the ",(0,i.kt)("inlineCode",{parentName:"p"},"configs")," directory is usually not used in the production environment of the service. You can use it to load configuration files for local development, so that the application can run locally for debugging. ",(0,i.kt)("strong",{parentName:"p"},"Do not put production environment configurations here."))),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"https://github.com/go-kratos/kratos-layout/tree/main/internal/conf"},"internal/conf"),": Here, you put the structure definitions of the configuration files. We use ",(0,i.kt)("inlineCode",{parentName:"p"},".proto")," files to define the configurations here, and then use ",(0,i.kt)("inlineCode",{parentName:"p"},"make config")," in the root directory to generate the corresponding ",(0,i.kt)("inlineCode",{parentName:"p"},".pb.go")," files in the same directory for use. In the initial state, the structure defined in the ",(0,i.kt)("inlineCode",{parentName:"p"},"conf.proto")," is the same as the structure of ",(0,i.kt)("inlineCode",{parentName:"p"},"configs/config.yaml"),", so please keep them consistent.")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"https://github.com/go-kratos/kratos-layout/blob/main/Makefile"},"make config"),": This command in the Makefile is used to generate the ",(0,i.kt)("inlineCode",{parentName:"p"},".pb.go")," files corresponding to the ",(0,i.kt)("inlineCode",{parentName:"p"},".proto")," definitions (which actually calls protoc) in the internal directory. Remember to execute this command every time you modify the definitions to regenerate the go files."))),(0,i.kt)("h4",{id:"2-configuration-generation-command"},"2. Configuration Generation Command"),(0,i.kt)("p",null,"We have already included the command for generating structs based on proto in the Makefile. You can generate the files by executing ",(0,i.kt)("inlineCode",{parentName:"p"},"make config")," in the project root directory. It actually calls the ",(0,i.kt)("inlineCode",{parentName:"p"},"protoc")," tool to scan the proto files in the internal directory and generate the corresponding ",(0,i.kt)("inlineCode",{parentName:"p"},".pb.go")," files."),(0,i.kt)("h4",{id:"3-usage"},"3. Usage"),(0,i.kt)("p",null,"The usage of reading configuration items, listening for configuration changes, and other advanced usages are the same as mentioned above, so we will not repeat them here."),(0,i.kt)("h2",{id:"further-reading"},"Further Reading"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://github.com/go-kratos/examples/tree/main/config"},"config example"),": Example code")))}p.isMDXComponent=!0}}]);