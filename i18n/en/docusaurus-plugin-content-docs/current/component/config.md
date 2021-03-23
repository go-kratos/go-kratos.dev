---
id: config
title: Config
---

### Usage
One or more config sources can be applied. They will be merged into map[string]interface{}, then you could use Scan or Value to get the values.

```go
c := config.New(
    config.WithSource(
        file.NewSource(path),
    ),
    config.WithDecoder(func(kv *config.KeyValue, v map[string]interface{}) error {
        // kv.Key
        // kv.Value
        // kv.Metadata
        // Configuration center can use the metadata to determine the type of the config.
        return yaml.Unmarshal(kv.Value, v)
    }),
)
// load config source
if err := c.Load(); err != nil {
    panic(err)
}
// get value
name, err := c.Value("service").String()
// parse the values to the struct. (the json tags are required for parsing)
var v struct {
    Service string `json:"service"`
    Version string `json:"version"`
}
if err := c.Scan(&v); err != nil {
    panic(err)
}
// watch the changing of the value
c.Watch("service.name", func(key string, value config.Value) {
    // callback of this event
})
```
