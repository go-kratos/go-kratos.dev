---
id: faq
title: FAQ
---

### `google/protobuf/descriptor.proto: File not found.` error while using `kratos proto` command.
This issue is mainly caused by the improperly installation of protoc. The documentation [protoc-installation](https://grpc.io/docs/protoc-installation/) shows the correct way to install protoc. It is highly recommended that install protoc by system package manager to ensure the installation's integrity. If you have to install the pre-compiled version, please refer to the `readme.txt` in the zip file, make sure all the files under `include` folder could be put to correct include path of your system, e.g. `/usr/local/include/`, so that protoc can find them while compiling.
