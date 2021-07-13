---
id: contribution
title: Contribution Guide
description: Contribution Guide
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
The kratos community wants to be helped by a wide range of developers, so you'd like to take a few minutes to read this guide before you mention the problem or pull request.

## Reportings Bug or Fixing Bugs
We use github issues to manage issues. If you want to submit , first make sure you've searched for existing issues, pull requests and read our [FAQ](https://go-kratos.dev/docs/intro/faq).

When submitting a bug report, use the issue template we provide to clearly describe the problems encountered and how to reproduce, and if convenient it is best to provide a minimal reproduce repository.

## Adding new features
If you want to improve or add new features, it is recommended that you also use the issue template to create a new feature of the issue and clearly describe the requirements of the feature in the issue.

## How to submit code
If you've never submitted code on github, follow these steps:

- First, please fork items to your github account
- Then create a new feature branch based on the main branch and name it features such as feature-log 
- Write code
- Submit code to the far end branch
- Submit a PR request in github
- Wait for review and merge to the main branch

**Note That when you submit a PR request, you first ensure that the code uses the correct coding specifications and that there are complete test cases, and that the information in the submission of the PR is best associated with the relevant issue to ease the workload of the auditor.**

## Conventional Commits

**Note: When you commit Pull Request, ensure the code uses correct coding specifications and has full test case. It is best to associate related issues in the information commited to the Pull Request to reduce the issues of the reviewers.**

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

> More: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary)

### type

There are the following types of commit:

#### Main

- **fix**: A bug fix
- **feat**: A new feature
- **deps**: Changes external dependencies
- **break**: Changes has break change

#### Other

- **docs**: Documentation only changes
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **test**: Adding missing tests or correcting existing tests
- **chore** Daily work, examples, etc.
- **ci**: Changes to our CI configuration files and scripts

### scope 

The following is the list of supported scopes:

- transport
- examples
- middleware
- config
- cmd
- etc.

### description

The description contains a succinct description of the change

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end

### body

The body should include the motivation for the change and contrast this with previous behavior.

### footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit Closes.

### examples


#### Only commit message
```
fix: The log debug level should be -1  
```

#### Attention
```
refactor!(transport/http): replacement underlying implementation
```

#### Full commit message
```
fix(log): [BREAKING-CHANGE] unable to meet the requirement of log Library

Explain the reason, purpose, realization method, etc.

Close #777
Doc change on doc/#111
BREAKING CHANGE:
  Breaks log.info api, log.log should be used instead
```
## Release

You can use `kratos changelog dev` to generate a change log during.

The following is the list of supported types:

- Breaking Change
- Dependencies
- Bug Fixes
- Others

