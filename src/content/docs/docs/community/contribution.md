---
id: contribution
title: Contribution Guide
description: How to report issues and contribute code to Kratos
---

Kratos uses GitHub issues and pull requests for framework development. Search
existing issues and pull requests before starting work, and keep one pull
request focused on one coherent change.

## Report a bug

Use the repository's bug report template. A useful report includes:

- the Kratos module and version, Go version, and operating system;
- the smallest code or repository that reproduces the problem;
- exact commands, input, actual result, and expected result;
- logs or stack traces with credentials and personal data removed;
- whether the problem occurs with the latest supported release or `main`.

Questions and configuration problems have separate issue templates. Do not use
a security-sensitive public issue when private disclosure is required by the
repository security policy.

## Propose a feature

Substantial features go through proposal, feature, and implementation stages.
Start with a proposal issue that explains the user problem, desired behavior,
alternatives, compatibility effect, and relevant references. After the
community agrees on the direction, a feature issue can describe the concrete
API and implementation. Link the implementation pull request to both.

Discuss public API and behavior before investing in a large patch. New core
dependencies, transport semantics, and breaking changes need especially clear
motivation because every Kratos service may inherit their maintenance cost.

## Prepare a code change

Fork the repository, branch from current `main`, and make the smallest complete
change that solves the issue.

```bash
git checkout -b fix/http-timeout
make clean
make lint
make test
```

`make clean` tidies modules through the repository tooling. `make lint` runs the
configured linters, and `make test` runs the module tests. Add focused tests for
changed behavior and regenerate affected protobuf code. The core CI tests Go
1.25.x and 1.26.x, so code must compile on both supported lines.

The repository contains several nested Go modules, especially under `contrib`.
Run checks in every module changed by the pull request. Do not update unrelated
module files or generated output.

## Open the pull request

Use the pull request template to explain the concrete problem, resulting
behavior, validation, compatibility effect, and linked issues. Open a draft
pull request while work is incomplete. Include migration notes when callers
must change code, and update English and Chinese documentation when the public
behavior changes.

Reviewers must be able to reproduce a fix from the description and tests. Keep
refactoring separate when it obscures the behavior under review.

## Commit and pull request titles

Kratos uses Conventional Commit style:

```text
<type>[optional scope][!]: <description>

[optional body]

[optional footer]
```

Common types are:

| Type | Use |
| --- | --- |
| `feat` | New behavior |
| `fix` | Bug fix |
| `deps` | Dependency change |
| `break` or `!` | Breaking change |
| `docs` | Documentation only |
| `refactor` | Code restructuring without behavior change |
| `test` | Test additions or corrections |
| `chore` | Maintenance and examples |
| `ci` | CI configuration |

Useful scopes include `transport`, `middleware`, `config`, `cmd`, and
`examples`. Write the description in imperative present tense, keep it concise,
and omit the final period.

```text
fix(transport/http): honor shutdown deadline
```

Put motivation and behavior details in the body. Use a footer such as
`BREAKING CHANGE:` for incompatible changes and `Fixes #1234` for an issue that
will be fully resolved.

## Release notes

Maintainers can use `kratos changelog dev` to collect changes since the previous
release and group them into breaking changes, dependencies, bug fixes, and
other changes. The generated text is a starting point: verify links, rewrite
unclear entries, and add migration guidance before publishing a release.

Documentation-only changes follow the separate
[Documentation Guide](/docs/community/documentation/).
