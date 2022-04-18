"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[4364],{3905:function(e,t,r){r.d(t,{Zo:function(){return s},kt:function(){return m}});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function c(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?c(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):c(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},c=Object.keys(e);for(n=0;n<c.length;n++)r=c[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(n=0;n<c.length;n++)r=c[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var a=n.createContext({}),p=function(e){var t=n.useContext(a),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},s=function(e){var t=p(e.components);return n.createElement(a.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,c=e.originalType,a=e.parentName,s=i(e,["components","mdxType","originalType","parentName"]),d=p(r),m=o,f=d["".concat(a,".").concat(m)]||d[m]||u[m]||c;return r?n.createElement(f,l(l({ref:t},s),{},{components:r})):n.createElement(f,l({ref:t},s))}));function m(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var c=r.length,l=new Array(c);l[0]=d;var i={};for(var a in t)hasOwnProperty.call(t,a)&&(i[a]=t[a]);i.originalType=e,i.mdxType="string"==typeof e?e:o,l[1]=i;for(var p=2;p<c;p++)l[p]=r[p];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},6228:function(e,t,r){r.r(t),r.d(t,{assets:function(){return s},contentTitle:function(){return a},default:function(){return m},frontMatter:function(){return i},metadata:function(){return p},toc:function(){return u}});var n=r(7462),o=r(3366),c=(r(7294),r(3905)),l=["components"],i={id:"selector",title:"\u8def\u7531\u4e0e\u8d1f\u8f7d\u5747\u8861",description:"\u8def\u7531\u4e0e\u8d1f\u8f7d\u5747\u8861\u4e3b\u8981\u7684\u63a5\u53e3\u662f Selector\uff0c\u4f46\u5728\u540c\u76ee\u5f55\u4e0b\u4e5f\u63d0\u4f9b\u4e86\u4e00\u4e2a\u9ed8\u8ba4\u7684 Selector \u5b9e\u73b0\uff0c\u8be5\u5b9e\u73b0\u53ef\u4ee5\u901a\u8fc7\u66ff\u6362 NodeBuilder\u3001Filter\u3001Balancer \u6765\u5206\u522b\u5b9e\u73b0\u8282\u70b9\u6743\u91cd\u8ba1\u7b97\u3001\u8def\u7531\u8fc7\u6ee4\u3001\u8d1f\u8f7d\u5747\u8861\u7b97\u6cd5\u7684\u53ef\u63d2\u62d4",keywords:["Go","Kratos","Framework","Microservices","Protobuf","gRPC","HTTP","Balancer","Route","Selector"]},a=void 0,p={unversionedId:"component/selector",id:"component/selector",title:"\u8def\u7531\u4e0e\u8d1f\u8f7d\u5747\u8861",description:"\u8def\u7531\u4e0e\u8d1f\u8f7d\u5747\u8861\u4e3b\u8981\u7684\u63a5\u53e3\u662f Selector\uff0c\u4f46\u5728\u540c\u76ee\u5f55\u4e0b\u4e5f\u63d0\u4f9b\u4e86\u4e00\u4e2a\u9ed8\u8ba4\u7684 Selector \u5b9e\u73b0\uff0c\u8be5\u5b9e\u73b0\u53ef\u4ee5\u901a\u8fc7\u66ff\u6362 NodeBuilder\u3001Filter\u3001Balancer \u6765\u5206\u522b\u5b9e\u73b0\u8282\u70b9\u6743\u91cd\u8ba1\u7b97\u3001\u8def\u7531\u8fc7\u6ee4\u3001\u8d1f\u8f7d\u5747\u8861\u7b97\u6cd5\u7684\u53ef\u63d2\u62d4",source:"@site/docs/component/09-selector.md",sourceDirName:"component",slug:"/component/selector",permalink:"/docs/component/selector",editUrl:"https://github.com/go-kratos/go-kratos.dev/edit/main/docs/component/09-selector.md",tags:[],version:"current",sidebarPosition:9,frontMatter:{id:"selector",title:"\u8def\u7531\u4e0e\u8d1f\u8f7d\u5747\u8861",description:"\u8def\u7531\u4e0e\u8d1f\u8f7d\u5747\u8861\u4e3b\u8981\u7684\u63a5\u53e3\u662f Selector\uff0c\u4f46\u5728\u540c\u76ee\u5f55\u4e0b\u4e5f\u63d0\u4f9b\u4e86\u4e00\u4e2a\u9ed8\u8ba4\u7684 Selector \u5b9e\u73b0\uff0c\u8be5\u5b9e\u73b0\u53ef\u4ee5\u901a\u8fc7\u66ff\u6362 NodeBuilder\u3001Filter\u3001Balancer \u6765\u5206\u522b\u5b9e\u73b0\u8282\u70b9\u6743\u91cd\u8ba1\u7b97\u3001\u8def\u7531\u8fc7\u6ee4\u3001\u8d1f\u8f7d\u5747\u8861\u7b97\u6cd5\u7684\u53ef\u63d2\u62d4",keywords:["Go","Kratos","Framework","Microservices","Protobuf","gRPC","HTTP","Balancer","Route","Selector"]},sidebar:"docs",previous:{title:"\u670d\u52a1\u6ce8\u518c\u4e0e\u53d1\u73b0",permalink:"/docs/component/registry"},next:{title:"\u4e2d\u95f4\u4ef6",permalink:"/docs/category/\u4e2d\u95f4\u4ef6"}},s={},u=[{value:"\u63a5\u53e3\u5b9e\u73b0",id:"\u63a5\u53e3\u5b9e\u73b0",level:3},{value:"\u4f7f\u7528\u65b9\u5f0f",id:"\u4f7f\u7528\u65b9\u5f0f",level:3},{value:"HTTP Client",id:"http-client",level:4},{value:"gRPC Client",id:"grpc-client",level:4}],d={toc:u};function m(e){var t=e.components,r=(0,o.Z)(e,l);return(0,c.kt)("wrapper",(0,n.Z)({},d,r,{components:t,mdxType:"MDXLayout"}),(0,c.kt)("h3",{id:"\u63a5\u53e3\u5b9e\u73b0"},"\u63a5\u53e3\u5b9e\u73b0"),(0,c.kt)("p",null,"\u8def\u7531\u4e0e\u8d1f\u8f7d\u5747\u8861\u4e3b\u8981\u7684\u63a5\u53e3\u662f Selector\uff0c\u5728\u540c\u76ee\u5f55\u4e0b\u4e5f\u63d0\u4f9b\u4e86\u4e00\u4e2a\u9ed8\u8ba4\u7684 Selector \u5b9e\u73b0\uff0c\u8be5\u5b9e\u73b0\u53ef\u4ee5\u901a\u8fc7\u66ff\u6362 NodeBuilder\u3001Filter\u3001Balancer \u6765\u5206\u522b\u5b9e\u73b0\u8282\u70b9\u6743\u91cd\u8ba1\u7b97\u7b97\u6cd5\u3001\u670d\u52a1\u8def\u7531\u8fc7\u6ee4\u7b56\u7565\u3001\u8d1f\u8f7d\u5747\u8861\u7b97\u6cd5\u7684\u53ef\u63d2\u62d4"),(0,c.kt)("pre",null,(0,c.kt)("code",{parentName:"pre",className:"language-go"},"type Selector interface {\n  // Selector \u5185\u90e8\u7ef4\u62a4\u7684\u670d\u52a1\u8282\u70b9\u5217\u8868\u901a\u8fc7 Rebalancer \u63a5\u53e3\u6765\u66f4\u65b0\n  Rebalancer\n\n  // Select nodes\n  // if err == nil, selected and done must not be empty.\n  Select(ctx context.Context, opts ...SelectOption) (selected Node, done DoneFunc, err error)\n}\n\n// \u901a\u8fc7Rebalancer\u5b9e\u73b0\u670d\u52a1\u8282\u70b9\u53d8\u66f4\u611f\u77e5\ntype Rebalancer interface {\n  Apply(nodes []Node)\n}\n")),(0,c.kt)("p",null,"\u5df2\u652f\u6301\u7684\u5b9e\u73b0\uff1a"),(0,c.kt)("ul",null,(0,c.kt)("li",{parentName:"ul"},(0,c.kt)("a",{parentName:"li",href:"https://github.com/go-kratos/kratos/tree/main/selector/wrr"},"wrr")," : Weighted round robin (Kratos Client\u5185\u7f6e\u9ed8\u8ba4\u7b97\u6cd5)"),(0,c.kt)("li",{parentName:"ul"},(0,c.kt)("a",{parentName:"li",href:"https://github.com/go-kratos/kratos/tree/main/selector/p2c"},"p2c")," : Power of two choices"),(0,c.kt)("li",{parentName:"ul"},(0,c.kt)("a",{parentName:"li",href:"https://github.com/go-kratos/kratos/tree/main/selector/random"},"random")," : Random")),(0,c.kt)("h3",{id:"\u4f7f\u7528\u65b9\u5f0f"},"\u4f7f\u7528\u65b9\u5f0f"),(0,c.kt)("h4",{id:"http-client"},"HTTP Client"),(0,c.kt)("pre",null,(0,c.kt)("code",{parentName:"pre",className:"language-go"},'import  "github.com/go-kratos/kratos/v2/selector/p2c"\nimport  "github.com/go-kratos/kratos/v2/selector/filter"\n\n// \u521b\u5efa\u8def\u7531 Filter\uff1a\u7b5b\u9009\u7248\u672c\u53f7\u4e3a"2.0.0"\u7684\u5b9e\u4f8b\nfilter :=  filter.Version("2.0.0")\n// \u521b\u5efa P2C \u8d1f\u8f7d\u5747\u8861\u7b97\u6cd5 Selector\uff0c\u5e76\u5c06\u8def\u7531 Filter \u6ce8\u5165\nselector := p2c.New(p2c.WithFilter(filter))\n\nhConn, err := http.NewClient(\n  context.Background(),\n  http.WithEndpoint("discovery:///helloworld"),\n  http.WithDiscovery(r),\n  // \u901a\u8fc7 http.WithSelector \u5c06 Selector \u6ce8\u5165 HTTP Client \u4e2d\n  http.WithSelector(\n    p2c.New(p2c.WithFilter(filter.Version("2.0.0"))),\n  )\n)\n')),(0,c.kt)("h4",{id:"grpc-client"},"gRPC Client"),(0,c.kt)("pre",null,(0,c.kt)("code",{parentName:"pre",className:"language-go"},'import  "github.com/go-kratos/kratos/v2/selector/p2c"\nimport  "github.com/go-kratos/kratos/v2/selector/filter"\n\n// \u521b\u5efa\u8def\u7531 Filter\uff1a\u7b5b\u9009\u7248\u672c\u53f7\u4e3a"2.0.0"\u7684\u5b9e\u4f8b\nfilter :=  filter.Version("2.0.0")\n\nconn, err := grpc.DialInsecure(\n  context.Background(),\n  grpc.WithEndpoint("discovery:///helloworld"),\n  grpc.WithDiscovery(r),\n  // \u7531\u4e8e gRPC \u6846\u67b6\u7684\u9650\u5236\uff0c\u53ea\u80fd\u4f7f\u7528\u5168\u5c40 balancer name \u7684\u65b9\u5f0f\u6765\u6ce8\u5165 selector\n  grpc.WithBalancerName(wrr.Name),\n  // \u901a\u8fc7 grpc.WithFilter \u6ce8\u5165\u8def\u7531 Filter\n  grpc.WithFilter(filter),\n)\n')))}m.isMDXComponent=!0}}]);