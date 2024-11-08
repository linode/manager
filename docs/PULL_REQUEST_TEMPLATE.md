## Description 📝
Highlight the Pull Request's context and intentions.

## Changes  🔄
List any change relevant to the reviewer.
- ...
- ...

## Target release date 🗓️
Please specify a release date to guarantee timely review of this PR. If exact date is not known, please approximate and update it as needed.

## Preview 📷
**Include a screenshot or screen recording of the change.**

:lock: Use the [Mask Sensitive Data](https://cloud.linode.com/profile/settings) setting for security.

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

- [ ] Use React components instead of HTML Tags
- [ ] Proper naming conventions like cameCase for variables & Function & snake_case for constants
- [ ] Use appropriate types & avoid using "any"
- [ ] No type casting & non-null assertions
- [ ] Adding a [changeset](https://github.com/linode/manager/blob/develop/docs/CONTRIBUTING.md#writing-a-changeset)
- [ ] Providing/Improving test coverage
- [ ] Use sx props to pass styles instead of style prop
- [ ] Add JSDoc comments for interface properties & functions
- [ ] Use strict equality (===) instead of double equal (==)
- [ ] Use of named arguments (interfaces) if function argument list exceeds size 2
- [ ] Destructure the props
- [ ] Keep component size small & move big computing functions to separate utility
- [ ] 📱 Providing mobile support

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
