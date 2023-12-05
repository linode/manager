---
nav_order: 3
---

# Contributing

Thanks for your interest in contributing to the Linode Cloud Manager!

You can contribute by [opening an issue](https://github.com/linode/manager/issues/new) or submitting a pull request.

## Opening an issue

Feel free to open an issue to report a bug or request a feature.

## Submitting a pull request

1. Fork this repository.
2. Clone your fork to your local machine.
3. Create a branch from `develop`, e.g. `$ git checkout develop && git pull && git checkout -b feature/my-feature`.
4. Make your changes, commit them following the standards below, and then push them to your fork.
5. Commit message format standard: `<commit type>: [JIRA-ticket-number] - <description>`

    **Commit Types:**
    `feat`: New feature for the user (not a part of the code, or ci, ...).
    `fix`: Bugfix for the user (not a fix to build something, ...).
    `change`: Modifying an existing visual UI instance. Such as a component or a feature.
    `refactor`: Restructuring existing code without changing its external behavior or visual UI. Typically to improve readability, maintainability, and performance.
    `test`: New tests or changes to existing tests. Does not change the production code.
    `upcoming`: A new feature that is in progress, not visible to users yet, and usually behind a feature flag.

    **Example:** `feat: [M3-1234] - Allow user to view their login history`

6. Open a pull request against `develop` and make sure the title follows the same format as the commit message.
7. If needed, create a changeset to populate our changelog
    -  If you don't have the Github CLI installed or need to update it (you need GH CLI 2.21.0 or greater),
        - install it via `brew`: https://cli.github.com/manual/installation or upgrade with `brew upgrade gh`
        - Once installed, run `gh repo set-default` and pick `linode/manager` (only > 2.21.0)
        - You can also just create the changeset manually, in this case make sure to use the proper formatting for it.
    - Run `yarn changeset`from the root, choose the package to create a changeset for, and provide a description for the change.
    You can either have it committed automatically or do it manually if you need to edit it.
    - A changeset is optional, it merely depends if it falls in one of the following categories:
    `Added`, `Fixed`, `Changed`, `Removed`, `Tech Stories`, `Tests`, `Upcoming Features`

Two reviews from members of the Cloud Manager team are required before merge. After approval, all pull requests are squash merged.
