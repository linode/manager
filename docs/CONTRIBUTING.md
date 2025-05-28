# Contributing

Thanks for your interest in contributing to the Linode Cloud Manager!

You can contribute by [opening an issue](https://github.com/linode/manager/issues/new) or submitting a pull request.

## Opening an issue

Feel free to open an issue to report a bug or request a feature.

## Submitting a pull request

1. Fork this repository.
2. Clone your fork to your local machine.
3. Create a branch from `develop`, e.g. `$ git checkout develop && git pull && git checkout -b feature/my-feature`.
4. Make your [small, focused](#sizing-a-pull-request) changes, commit them following the standards below, and then push them to your fork.
5. Commit message format standard: `<commit type>: [JIRA-ticket-number] - <description>`

    **Commit Types:**
    - `feat`: New feature for the user (not a part of the code, or ci, ...).
    - `fix`: Bugfix for the user (not a fix to build something, ...).
    - `change`: Modifying an existing visual UI instance. Such as a component or a feature.
    - `refactor`: Restructuring existing code without changing its external behavior or visual UI. Typically to improve readability, maintainability, and performance.
    - `test`: New tests or changes to existing tests. Does not change the production code.
    - `upcoming`: A new feature that is in progress, not visible to users yet, and usually behind a feature flag.

    **Example:** `feat: [M3-1234] - Allow user to view their login history`

6. Open a pull request against `develop` and make sure the title follows the same format as the commit message.
7. Keep in mind that our repository is public and open source! Before adding screenshots to your PR, we recommend you enable the **Mask Sensitive Data** setting in Cloud Manager [Profile Settings](https://cloud.linode.com/profile/settings).
8. If needed, create a changeset to populate our changelog.
    - If you don't have the Github CLI installed or need to update it (you need GH CLI 2.21.0 or greater),
        - install it via `brew`: https://github.com/cli/cli#installation or upgrade with `brew upgrade gh`
        - Once installed, run `gh repo set-default` and pick `linode/manager` (only > 2.21.0)
        - You can also just create the changeset manually, in this case make sure to use the proper formatting for it.
    - Run `pnpm changeset`from the root, choose the package to create a changeset for, and provide a description for the change.
    You can either have it committed automatically or do it manually if you need to edit it.
    - A changeset is optional, but should be included if the PR falls in one of the following categories:<br>
    `Added`, `Fixed`, `Changed`, `Removed`, `Tech Stories`, `Tests`, `Upcoming Features`
      - Select the changeset category that matches the commit type in your PR title. (Where this isn't a 1:1 match: generally, a `feat` commit type falls under an `Added` change and `refactor` falls under `Tech Stories`.)
      - Write your changeset by following our [best practices](#writing-a-changeset).

Two reviews from members of the Cloud Manager team are required before merge. After approval, all pull requests are squash merged.

## Writing a changeset

Follow these best practices to write a good changeset:

- Summarize your changes succinctly in 150 characters or less. A changeset shouldn't describe every line of code edited in the PR.
- Use a consistent tense in all changeset entries. We have chosen to use **imperative (present)** tense. (This follows established [git commit message best practices](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).)
- Avoid starting a changeset with the verb "Add", "Remove", "Change" or "Fix" when listed under that respective `Added`, `Removed`, `Changed` or `Fixed` section. It is unnecessary repetition.
- For `Fixed` changesets, describe the bug that needed to be fixed, rather than the fix itself. (e.g. say "Missing button labels in action buttons" rather than "Make label prop required for action buttons").
- Begin a changeset with a capital letter, but do not end it with a period; it's not a complete sentence.
- When referencing code, consider adding backticks for readability. (e.g. "Update `updateImageRegions` to accept `UpdateImageRegionsPayload` instead of `regions: string[]`").
- Use the `Upcoming Features` section for ongoing project work that is behind a feature flag. If additional changes are being made that are not feature flagged, add another changeset to describe that work.
- Add changesets for `docs/` documentation changes in the `manager` package, as this is generally best-fit.
- Generally, if the code change is a fix for a previous change that has been merged to `develop` but was never released to production, we don't need to include a changeset.

## Sizing a pull request

A good PR is small.

Examples of ‘small’:

- Changing a docker file
- Updating a dependency ([Example 1](https://github.com/linode/manager/pull/10291), [Example 2](https://github.com/linode/manager/pull/10212))
- Fixing 1 bug ([Example 1](https://github.com/linode/manager/pull/10583), [Example 2](https://github.com/linode/manager/pull/9726))
- Creating 1 new component with unit test coverage ([Example](https://github.com/linode/manager/pull/9520))
- Adding a new util with unit test coverage

Diff size: A good PR is less than 500 changes, closer to [200](https://github.com/google/eng-practices/blob/master/review/developer/small-cls.md).

A good PR does **exactly one thing**, and is clear about what that is in the description.
Break down *additional* things in your PR into multiple PRs (like you would do with tickets).

## Docs

To run the docs development server locally, [install Bun](https://bun.sh/) and start the server: `pnpm run docs`.
