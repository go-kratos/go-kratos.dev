"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[9550],{3905:function(e,n,t){t.d(n,{Zo:function(){return p},kt:function(){return m}});var r=t(7294);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function c(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function i(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var s=r.createContext({}),l=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):c(c({},n),e)),t},p=function(e){var n=l(e.components);return r.createElement(s.Provider,{value:n},e.children)},d={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},u=r.forwardRef((function(e,n){var t=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),u=l(t),m=o,g=u["".concat(s,".").concat(m)]||u[m]||d[m]||a;return t?r.createElement(g,c(c({ref:n},p),{},{components:t})):r.createElement(g,c({ref:n},p))}));function m(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var a=t.length,c=new Array(a);c[0]=u;var i={};for(var s in n)hasOwnProperty.call(n,s)&&(i[s]=n[s]);i.originalType=e,i.mdxType="string"==typeof e?e:o,c[1]=i;for(var l=2;l<a;l++)c[l]=t[l];return r.createElement.apply(null,c)}return r.createElement.apply(null,t)}u.displayName="MDXCreateElement"},5510:function(e,n,t){t.r(n),t.d(n,{assets:function(){return p},contentTitle:function(){return s},default:function(){return m},frontMatter:function(){return i},metadata:function(){return l},toc:function(){return d}});var r=t(7462),o=t(3366),a=(t(7294),t(3905)),c=["components"],i={id:"encoding",title:"\u5e8f\u5217\u5316",keywords:["Go","Kratos","Toolkit","Framework","Microservices","Protobuf","gRPC","HTTP"]},s=void 0,l={unversionedId:"component/encoding",id:"component/encoding",title:"\u5e8f\u5217\u5316",description:"\u6211\u4eec\u62bd\u8c61\u51fa\u4e86Codec\u63a5\u53e3\uff0c\u7528\u4e8e\u7edf\u4e00\u5904\u7406\u8bf7\u6c42\u7684\u5e8f\u5217\u5316/\u53cd\u5e8f\u5217\u5316\u903b\u8f91\uff0c\u60a8\u4e5f\u53ef\u4ee5\u5b9e\u73b0\u60a8\u81ea\u5df1\u7684Codec\u4ee5\u4fbf\u652f\u6301\u66f4\u591a\u683c\u5f0f\u3002\u5177\u4f53\u6e90\u4ee3\u7801\u5728encoding\u3002",source:"@site/docs/component/03-encoding.md",sourceDirName:"component",slug:"/component/encoding",permalink:"/docs/component/encoding",editUrl:"https://github.com/go-kratos/go-kratos.dev/edit/main/docs/component/03-encoding.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{id:"encoding",title:"\u5e8f\u5217\u5316",keywords:["Go","Kratos","Toolkit","Framework","Microservices","Protobuf","gRPC","HTTP"]},sidebar:"docs",previous:{title:"\u914d\u7f6e",permalink:"/docs/component/config"},next:{title:"\u9519\u8bef\u5904\u7406",permalink:"/docs/component/errors"}},p={},d=[{value:"\u63a5\u53e3\u5b9e\u73b0",id:"\u63a5\u53e3\u5b9e\u73b0",level:3},{value:"\u5b9e\u73b0\u793a\u4f8b",id:"\u5b9e\u73b0\u793a\u4f8b",level:3},{value:"\u4f7f\u7528\u65b9\u5f0f",id:"\u4f7f\u7528\u65b9\u5f0f",level:3},{value:"\u6ce8\u518c Codec",id:"\u6ce8\u518c-codec",level:4},{value:"\u83b7\u53d6 Codec",id:"\u83b7\u53d6-codec",level:4},{value:"\u5e8f\u5217\u5316",id:"\u5e8f\u5217\u5316",level:4},{value:"\u53cd\u5e8f\u5217\u5316",id:"\u53cd\u5e8f\u5217\u5316",level:4}],u={toc:d};function m(e){var n=e.components,t=(0,o.Z)(e,c);return(0,a.kt)("wrapper",(0,r.Z)({},u,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"\u6211\u4eec\u62bd\u8c61\u51fa\u4e86",(0,a.kt)("inlineCode",{parentName:"p"},"Codec"),"\u63a5\u53e3\uff0c\u7528\u4e8e\u7edf\u4e00\u5904\u7406\u8bf7\u6c42\u7684\u5e8f\u5217\u5316/\u53cd\u5e8f\u5217\u5316\u903b\u8f91\uff0c\u60a8\u4e5f\u53ef\u4ee5\u5b9e\u73b0\u60a8\u81ea\u5df1\u7684Codec\u4ee5\u4fbf\u652f\u6301\u66f4\u591a\u683c\u5f0f\u3002\u5177\u4f53\u6e90\u4ee3\u7801\u5728",(0,a.kt)("a",{parentName:"p",href:"https://github.com/go-kratos/kratos/tree/main/encoding"},"encoding"),"\u3002"),(0,a.kt)("p",null,"\u76ee\u524d\u5185\u7f6e\u652f\u6301\u4e86\u5982\u4e0b\u683c\u5f0f\uff1a"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"form"),(0,a.kt)("li",{parentName:"ul"},"json"),(0,a.kt)("li",{parentName:"ul"},"protobuf"),(0,a.kt)("li",{parentName:"ul"},"xml"),(0,a.kt)("li",{parentName:"ul"},"yaml")),(0,a.kt)("h3",{id:"\u63a5\u53e3\u5b9e\u73b0"},"\u63a5\u53e3\u5b9e\u73b0"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"encoding")," \u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"Codec")," \u63a5\u53e3\u4e2d,\u5305\u542b\u4e86 Marshal\uff0cUnmarshal\uff0cName \u4e09\u4e2a\u65b9\u6cd5\uff0c\u7528\u6237\u53ea\u9700\u8981\u5b9e\u73b0 ",(0,a.kt)("inlineCode",{parentName:"p"},"Codec")," \u5373\u53ef\u4f7f\u7528\u81ea\u5b9a\u4e49\u7684 ",(0,a.kt)("inlineCode",{parentName:"p"},"encoding"),"\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-go"},"// Codec \u7528\u4e8e\u5b9a\u4e49\u4f20\u8f93\u65f6\u7528\u5230\u7684\u7f16\u7801\u548c\u89e3\u7801\u63a5\u53e3\uff0c\u5b9e\u73b0\u8fd9\u4e2a\u63a5\u53e3\u65f6\u5fc5\u987b\u6ce8\u610f\uff0c\u5b9e\u73b0\u5fc5\u987b\u662f\u7ebf\u7a0b\u5b89\u5168\u7684\uff0c\u53ef\u4ee5\u5e76\u53d1\u534f\u7a0b\u8c03\u7528\u3002\ntype Codec interface {\n    Marshal(v interface{}) ([]byte, error)\n    Unmarshal(data []byte, v interface{}) error\n    Name() string\n}\n")),(0,a.kt)("h3",{id:"\u5b9e\u73b0\u793a\u4f8b"},"\u5b9e\u73b0\u793a\u4f8b"),(0,a.kt)("p",null,"\u5728\u5b9e\u73b0 ",(0,a.kt)("inlineCode",{parentName:"p"},"Codec")," \u65f6\uff0c\u53ef\u4ee5\u53c2\u8003 kratos \u7684\u5185\u7f6e\u5b9e\u73b0, \u5982 json encoding\uff0c\u6e90\u4ee3\u7801\u5982\u4e0b\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-go"},'// https://github.com/go-kratos/kratos/blob/main/encoding/json/json.go\npackage json\n\nimport (\n    "encoding/json"\n    "reflect"\n\n    "github.com/go-kratos/kratos/v2/encoding"\n    "google.golang.org/protobuf/encoding/protojson"\n    "google.golang.org/protobuf/proto"\n)\n\n// Name is the name registered for the json codec.\nconst Name = "json"\n\nvar (\n    // MarshalOptions is a configurable JSON format marshaller.\n    MarshalOptions = protojson.MarshalOptions{\n        EmitUnpopulated: true,\n    }\n    // UnmarshalOptions is a configurable JSON format parser.\n    UnmarshalOptions = protojson.UnmarshalOptions{\n        DiscardUnknown: true,\n    }\n)\n\nfunc init() {\n    encoding.RegisterCodec(codec{})\n}\n\n// codec is a Codec implementation with json.\ntype codec struct{}\n\nfunc (codec) Marshal(v interface{}) ([]byte, error) {\n    switch m := v.(type) {\n    case json.Marshaler:\n        return m.MarshalJSON()\n    case proto.Message:\n        return MarshalOptions.Marshal(m)\n    default:\n        return json.Marshal(m)\n    }\n}\n\nfunc (codec) Unmarshal(data []byte, v interface{}) error {\n    switch m := v.(type) {\n    case json.Unmarshaler:\n        return m.UnmarshalJSON(data)\n    case proto.Message:\n        return UnmarshalOptions.Unmarshal(data, m)\n    default:\n        rv := reflect.ValueOf(v)\n        for rv := rv; rv.Kind() == reflect.Ptr; {\n            if rv.IsNil() {\n                rv.Set(reflect.New(rv.Type().Elem()))\n            }\n            rv = rv.Elem()\n        }\n        if m, ok := reflect.Indirect(rv).Interface().(proto.Message); ok {\n            return UnmarshalOptions.Unmarshal(data, m)\n        }\n        return json.Unmarshal(data, m)\n    }\n}\n\nfunc (codec) Name() string {\n    return Name\n}\n')),(0,a.kt)("h3",{id:"\u4f7f\u7528\u65b9\u5f0f"},"\u4f7f\u7528\u65b9\u5f0f"),(0,a.kt)("h4",{id:"\u6ce8\u518c-codec"},"\u6ce8\u518c Codec"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-go"},"encoding.RegisterCodec(codec{})\n")),(0,a.kt)("h4",{id:"\u83b7\u53d6-codec"},"\u83b7\u53d6 Codec"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-go"},'jsonCodec := encoding.GetCodec("json")\n')),(0,a.kt)("h4",{id:"\u5e8f\u5217\u5316"},"\u5e8f\u5217\u5316"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-go"},'// \u76f4\u63a5\u4f7f\u7528\u5185\u7f6e Codec \u65f6\u9700\u8981 import _ "github.com/go-kratos/kratos/v2/encoding/json"\njsonCodec := encoding.GetCodec("json")\ntype user struct {\n    Name string\n    Age string\n    state bool\n}\nu := &user{\n    Name:  "kratos",\n    Age:   "2",\n    state: false,\n}\nbytes, _ := jsonCodec.Marshal(u)\nfmt.Println(string(bytes))\n// \u8f93\u51fa\uff1a{"Name":"kratos","Age":"2"}\n')),(0,a.kt)("h4",{id:"\u53cd\u5e8f\u5217\u5316"},"\u53cd\u5e8f\u5217\u5316"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-go"},'// \u76f4\u63a5\u4f7f\u7528\u5185\u7f6e Codec \u65f6\u9700\u8981 import _ "github.com/go-kratos/kratos/v2/encoding/json"\njsonCodec := encoding.GetCodec("json")\ntype user struct {\n    Name string\n    Age string\n    state bool\n}\nu := &user{}\njsonCodec.Unmarshal([]byte(`{"Name":"kratos","Age":"2"}`), &u)\nfmt.Println(*u)\n// \u8f93\u51fa\uff1a&{kratos 2 false}\n')))}m.isMDXComponent=!0}}]);