## PR Type

- [ ] Feature
- [ ] Bug Fix
- [ ] Change / Optimization
- [ ] Tech Story
- [ ] Upcoming Feature

## Description

## As an Author I have considered
- [ ] :eyes: Doing a self review
- [ ] 👷‍♀️ Create small PRs. In most cases this will be possible.
- [ ] ✅ Provide tests for your changes.
- [ ] 📝 Use descriptive commit messages.
- [ ] 📗 Update any related documentation and include any relevant screenshots.




## Related Tickets & Documents

<!--
For pull requests that relate or close an issue, please include them
below.  We like to follow [Github's guidance on linking issues to pull requests](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue).

For example having the text: "closes #1234" would connect the current pull
request to issue 1234.  And when we merge the pull request, Github will
automatically close the issue.
-->

- Related Issue #
- Closes #

## QA Instructions, Screenshots, Recordings

_Please replace this line with instructions on how to test your changes, a note
on the devices and browsers this has been tested on, as well as any relevant
images for UI changes._

### UI accessibility checklist
_If your PR includes UI changes, please utilize this checklist:_
- [ ] Semantic HTML implemented?
- [ ] Keyboard operability supported?
- [ ] Checked with [axe DevTools](https://www.deque.com/axe/) and addressed `Critical` and `Serious` issues?
- [ ] Color contrast tested?

_For more info, check out the
[Forem Accessibility Docs](https://developers.forem.com/frontend/accessibility)._

## Added/updated tests?
_We encourage you to keep the code coverage percentage at 80% and above._

- [ ] Yes
- [ ] No, and this is why: _please replace this line with details on why tests
      have not been included_
- [ ] I need help with writing tests

## [optional] Are there any post deployment tasks we need to perform?

## [optional] What gif best describes this PR or how it makes you feel?

![alt_text](gif_link) 

## Description 📝


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
1. **How to setup test environment?**
2. **How to reproduce the issue (if applicable)?**
3. **How to verify changes?**
4. **How to run Unit or E2E tests?**

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
