"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[9024],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return m}});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var c=r.createContext({}),s=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},u=function(e){var t=s(e.components);return r.createElement(c.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,c=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),d=s(n),m=o,g=d["".concat(c,".").concat(m)]||d[m]||p[m]||i;return n?r.createElement(g,a(a({ref:t},u),{},{components:n})):r.createElement(g,a({ref:t},u))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,a=new Array(i);a[0]=d;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:o,a[1]=l;for(var s=2;s<i;s++)a[s]=n[s];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},5611:function(e,t,n){n.r(t),n.d(t,{assets:function(){return u},contentTitle:function(){return c},default:function(){return m},frontMatter:function(){return l},metadata:function(){return s},toc:function(){return p}});var r=n(7462),o=n(3366),i=(n(7294),n(3905)),a=["components"],l={id:"selector",title:"Routing and Load Balancing",description:"The main interface for routing and load balancing is Selector, but a default Selector implementation is also provided in the same directory. This implementation can implement node weight calculation, route filtering, and load balancing algorithms by replacing NodeBuilder, Filter, Balancer, and Pluggable",keywords:["Go","Kratos","Framework","Microservices","Protobuf","gRPC","HTTP","Balancer","Route","Selector"]},c=void 0,s={unversionedId:"component/selector",id:"component/selector",title:"Routing and Load Balancing",description:"The main interface for routing and load balancing is Selector, but a default Selector implementation is also provided in the same directory. This implementation can implement node weight calculation, route filtering, and load balancing algorithms by replacing NodeBuilder, Filter, Balancer, and Pluggable",source:"@site/i18n/en/docusaurus-plugin-content-docs/current/component/09-selector.md",sourceDirName:"component",slug:"/component/selector",permalink:"/en/docs/component/selector",editUrl:"https://github.com/go-kratos/go-kratos.dev/edit/main/i18n/en/docusaurus-plugin-content-docs/current/component/09-selector.md",tags:[],version:"current",sidebarPosition:9,frontMatter:{id:"selector",title:"Routing and Load Balancing",description:"The main interface for routing and load balancing is Selector, but a default Selector implementation is also provided in the same directory. This implementation can implement node weight calculation, route filtering, and load balancing algorithms by replacing NodeBuilder, Filter, Balancer, and Pluggable",keywords:["Go","Kratos","Framework","Microservices","Protobuf","gRPC","HTTP","Balancer","Route","Selector"]},sidebar:"docs",previous:{title:"Registry",permalink:"/en/docs/component/registry"},next:{title:"\u4e2d\u95f4\u4ef6",permalink:"/en/docs/category/\u4e2d\u95f4\u4ef6"}},u={},p=[{value:"Interface Implementation",id:"interface-implementation",level:3},{value:"How to use",id:"how-to-use",level:3},{value:"HTTP Client",id:"http-client",level:4},{value:"gRPC Client",id:"grpc-client",level:4}],d={toc:p};function m(e){var t=e.components,n=(0,o.Z)(e,a);return(0,i.kt)("wrapper",(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h3",{id:"interface-implementation"},"Interface Implementation"),(0,i.kt)("p",null,"The main interface for routing and load balancing is Selector, and a default Selector implementation is also provided in the same directory. This implementation can implement node weight calculation algorithm, service routing filtering strategy, and load balancing algorithm by replacing NodeBuilder, Filter, Balancer, and Pluggable"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},"type Selector interface {\n    // The list of service nodes maintained internally by the Selector is updated through the Rebalancer interface\n    Rebalancer\n\n    // Select nodes\n    // if err == nil, selected and done must not be empty.\n    Select(ctx context.Context, opts ...SelectOption) (selected Node, done DoneFunc, err error)\n}\n\n// Realize service node change awareness through Rebalancer\ntype Rebalancer interface {\n    Apply(nodes []Node)\n}\n")),(0,i.kt)("p",null,"Supported implementations:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://github.com/go-kratos/kratos/tree/main/selector/wrr"},"wrr")," : Weighted round robin (Kratos Client built-in default algorithm)"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://github.com/go-kratos/kratos/tree/main/selector/p2c"},"p2c")," : Power of two choices"),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://github.com/go-kratos/kratos/tree/main/selector/random"},"random")," : Random")),(0,i.kt)("h3",{id:"how-to-use"},"How to use"),(0,i.kt)("h4",{id:"http-client"},"HTTP Client"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},'import "github.com/go-kratos/kratos/v2/selector/p2c"\nimport "github.com/go-kratos/kratos/v2/selector/filter"\n\n// Create a route Filter: filter instances with version number "2.0.0"\nfilter := filter.Version("2.0.0")\n// Create P2C load balancing algorithm Selector, and inject routing Filter\nselector := p2c.New(p2c.WithFilter(filter))\n\nhConn, err := http.NewClient(\n  context.Background(),\n  http.WithEndpoint("discovery:///helloworld"),\n  http.WithDiscovery(r),\n  // Inject Selector into HTTP Client through http.WithSelector\n  http.WithSelector(\n    p2c.New(p2c.WithFilter(filter.Version("2.0.0"))),\n  )\n)\n')),(0,i.kt)("h4",{id:"grpc-client"},"gRPC Client"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-go"},'import "github.com/go-kratos/kratos/v2/selector/p2c"\nimport "github.com/go-kratos/kratos/v2/selector/filter"\n\n// Create a route Filter: filter instances with version number "2.0.0"\nfilter := filter.Version("2.0.0")\n\nconn, err := grpc.DialInsecure(\n  context.Background(),\n  grpc.WithEndpoint("discovery:///helloworld"),\n  grpc.WithDiscovery(r),\n  // Due to the limitations of the gRPC framework, only the global balancer name can be used to inject the selector\n  grpc.WithBalancerName(wrr.Name),\n  // Inject routing Filter through grpc.WithFilter\n  grpc.WithFilter(filter),\n)\n')))}m.isMDXComponent=!0}}]);