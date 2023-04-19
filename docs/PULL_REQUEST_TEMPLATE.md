## Description 📝
**Brief description explaining the purpose of the changes**

## Major Changes 🔄
**List highlighting major changes**
- Change #1
- Change #2

## Preview 📷
**Include a screenshot or screen recording of the change**

> **Note**: Use `<video src="" />` tag when including recordings in table

| Before  | After   |
| ------- | ------- |
| Content | Content |

## How to test 🧪
1. How to setup test environment?
2. How to reproduce the issue (if applicable)?
3. How to verify changes?
4. How to run Unit or E2E tests?

## Commit message and pull request title format standards

> **Note**: Remove this section before opening the pull request

**Make sure your PR title and commit message on squash and merge are as shown below**

`<commit type>: [JIRA-ticket-number] - <description>`

**Commit Types:**
- `feat`: New feature for the user (not a part of the code, or ci, ...).
- `fix`: Bugfix for the user (not a fix to build something, ...).
- `refactor`: Restructuring existing code without changing its external behavior or visual UI. Typically to improve readability, maintainability, and performance.
- `style`: General styling changes. Does not change any functionality.
- `build`: Changes to the application build.
- `chore`: Other changes that do not impact production code.
- `ci`: Changes to the CI pipeline.
- `docs`: Changes to the documentation docs.
- `perf`: Performance changes.
- `test`: New tests or changes to existing tests. Does not change the production code.
- `change`: Only use for something that doesn’t fit in any other category.

**Example:** `feat: [M3-1234] - Allow user to view their login history`
