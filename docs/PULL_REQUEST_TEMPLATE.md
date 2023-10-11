## Description 📝
Highlight the Pull Request's context and intentions.

## Changes  🔄
List any change relevant to the reviewer.
- ...
- ...

## Preview 📷
**Include a screenshot or screen recording of the change**

:bulb: Use `<video src="" />` tag when including recordings in table.

| Before  | After   |
| ------- | ------- |
| 📷 | 📷 |

## How to test 🧪

### Prerequisites
(How to setup test environment)
- ...
- ...

### Reproduction steps
(How to reproduce the issue, if applicable)
- ...
- ...

### Verification steps 
(How to verify changes)
- ...
- ...

## As an Author I have considered 🤔

*Check all that apply*

- [ ] 👀 Doing a self review
- [ ] ❔ Our [contribution guidelines](https://github.com/linode/manager/blob/develop/docs/CONTRIBUTING.md)
- [ ] 🤏 Splitting feature into small PRs
- [ ] ➕ Adding a changeset
- [ ] 🧪 Providing/Improving test coverage
- [ ] 🔐 Removing all sensitive information from the code and PR description
- [ ] 🚩 Using a feature flag to protect the release
- [ ] 👣 Providing comprehensive reproduction steps
- [ ] 📑 Providing or updating our documentation
- [ ] 🕛 Scheduling a pair reviewing session
- [ ] 📱 Providing mobile support
- [ ] ♿  Providing accessibility support

---
## Commit message and pull request title format standards

> **Note**: Remove this section before opening the pull request
**Make sure your PR title and commit message on squash and merge are as shown below**

`<commit type>: [JIRA-ticket-number] - <description>`

**Commit Types:**
- `feat`: New feature for the user (not a part of the code, or ci, ...).
- `fix`: Bugfix for the user (not a fix to build something, ...).
- `change`: Modifying an existing visual UI instance. Such as a component or a feature.
- `refactor`: Restructuring existing code without changing its external behavior or visual UI. Typically to improve readability, maintainability, and performance.
- `test`: New tests or changes to existing tests. Does not change the production code.
- `upcoming`: A new feature that is in progress, not visible to users yet, and usually behind a feature flag.

**Example:** `feat: [M3-1234] - Allow user to view their login history`

---
