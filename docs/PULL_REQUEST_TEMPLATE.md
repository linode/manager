## PR Type

[ ] Feature<br>
[ ] Bug Fix<br>
[ ] Change<br>
[ ] Tech Story / Refactor<br>
[ ] Upcoming Feature

## Description
Highlight the Pull Request's context and intentions.

List of changes.
- ...
- ...

## Preview
**Include a screenshot or screen recording of the change**

:bulb: Use `<video src="" />` tag when including recordings in table

| Before  | After   |
| ------- | ------- |
| 📷 | 📷 |

## How to test

### Prerequisites
- ...
- ...

### Reproduction steps
- ...
- ...

### Post deployment tasks
- ...
- ...
## As an Author I have considered
*Check all that apply*<br>
<br>
[ ] 👀 Doing a self review<br>
[ ] ❔ Our [contribution guidelines](https://github.com/linode/manager/blob/develop/docs/CONTRIBUTING.md)<br>
[ ] 🤏 Splitting feature into small PRs<br>
[ ] ➕ Adding a changeset<br>
[ ] 🧪 Providing/Improving test coverage<br>
[ ] 🚩 Using a feature flag to protect the release<br>
[ ] 👣 Providing comprehensive reproduction steps<br>
[ ] 📑 Providing or updating our documentation<br>
[ ] 🕛 Scheduling a pair reviewing session<br>
[ ] 📱 Providing mobile support<br>
[ ] ♿  Providing accessibility support

## Commit message and pull request title format standards

> **Note**: Remove this section before opening the pull request
**Make sure your PR title and commit message on squash and merge are as shown below**

`<commit type>: [JIRA-ticket-number] - <description>`

**Commit Types:**
- `feat`: New feature for the user (not a part of the code, or ci, ...).
- `fix`: Bugfix for the user (not a fix to build something, ...).
- `change`: Modifying an existing visual UI instance. Such as a component or a feature.
- `refactor`: Restructuring existing code without changing its external behavior or visual UI. Typically to improve readability, maintainability, and performance.
- `upcoming`: A new feature that is in progress, not visible to users yet, and usually behind a feature flag.

**Example:** `feat: [M3-1234] - Allow user to view their login history`