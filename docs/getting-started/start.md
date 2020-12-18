---
id: start
title: 开始
slug: /
---

## 开始


bash语法高亮测试

```bash
#!/bin/bash
var="Hello World"
 
# Run date and hostname command and store output to shell variables
now="$(date)"
computer_name="$(hostname)"
 
#
# print it or use the variable
# Variable names are case sensitive $now and $NOW are different names
#
echo "$var"
echo "Current date and time : $now"
echo "Computer name : $computer_name"
echo ""

go get -u github.com/go-kratos/kratos/cmd/kratos
```

go语法高亮测试

```go
package config

import (
	"encoding/json"
	"strings"

	"github.com/ghodss/yaml"
	"github.com/golang/protobuf/jsonpb"
	"github.com/golang/protobuf/proto"
	"github.com/pelletier/go-toml"
)

func ApplyJSON(js string, pb proto.Message) error {
	reader := strings.NewReader(js)
	m := jsonpb.Unmarshaler{}
	if err := m.Unmarshal(reader, pb); err != nil {
		m.AllowUnknownFields = true
		reader.Reset(js)
		return m.Unmarshal(reader, pb)
	}
	return nil
}
```

protobuf语法高亮测试

```protobuf
syntax = "proto3";
package config.example.v1;

import "google/protobuf/wrappers.proto";
option go_package = ".;example";

message example_config {
    string address = 1;
    google.protobuf.StringValue password = 2;
    google.protobuf.Int64Value timeout = 3;
}
```

yaml

```yaml
key: value
another_key: Another value goes here.
a_number_value: 100
scientific_notation: 1e+12

a_sequence:
  - Item 1
  - Item 2
  - 0.5  # sequences can contain disparate types.
  - Item 4
  - key: value
    another_key: another_value
  -
    - This is a sequence
    - inside another sequence
  - - - Nested sequence indicators
      - can be collapsed

```

**极为先进的JSON**

```json
{
  "key": "value",

  "keys": "must always be enclosed in double quotes",
  "numbers": 0,
  "strings": "Hellø, wørld. All unicode is allowed, along with \"escaping\".",
  "has bools?": true,
  "nothingness": null,

  "big number": 1.2e+100,

  "objects": {
    "comment": "Most of your structure will come from objects.",

    "array": [0, 1, 2, 3, "Arrays can have anything in them.", 5],

    "another object": {
      "comment": "These things can be nested, very useful."
    }
  }
}

```