## Description 📝

Highlight the Pull Request's context and intentions.

## Changes  🔄

List any change(s) relevant to the reviewer.

- ...
- ...

## Target release date 🗓️

Please specify a release date (and environment, if applicable) to guarantee timely review of this PR. If exact date is not known, please approximate and update it as needed.

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

- [ ] ...
- [ ] ...

### Verification steps

(How to verify changes)

- [ ] ...
- [ ] ...

<details>
<summary> Author Checklists </summary>

## As an Author, to speed up the review process, I considered 🤔

👀 Doing a self review
❔ Our [contribution guidelines](https://github.com/linode/manager/blob/develop/docs/CONTRIBUTING.md)
🤏 Splitting feature into small PRs
➕ Adding a [changeset](https://github.com/linode/manager/blob/develop/docs/CONTRIBUTING.md#writing-a-changeset)
🧪 Providing/improving test coverage
 🔐 Removing all sensitive information from the code and PR description
🚩 Using a feature flag to protect the release
👣 Providing comprehensive reproduction steps
📑 Providing or updating our documentation
🕛 Scheduling a pair reviewing session
📱 Providing mobile support
♿  Providing accessibility support

<br/>

- [ ] I have read and considered all applicable items listed above.

## As an Author, before moving this PR from Draft to Open, I confirmed ✅

- [ ] All unit tests are passing
- [ ] TypeScript compilation succeeded without errors
- [ ] Code passes all linting rules

</details>

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
