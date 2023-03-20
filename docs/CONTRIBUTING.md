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

    **commit types:**  
    `feat`: New feature for the user (not a part of the code, or ci, ...).  
    `fix`: Bugfix for the user (not a fix to build something, ...).  
    `refactor`: Refactoring production code. For example: Renaming a variable.  
    `style`: General styling changes. Does not change any functionality.  
    `build`: Changes to the application build.  
    `chore`: Other changes that do not impact production code.  
    `ci`: Changes to the CI pipeline.  
    `docs`: Changes to the documentation docs.  
    `perf`: Performance changes.  
    `test`: New tests or changes to existing tests. Does not change the production code.
    
    **Example:** `feat: [M3-1234] - Allow user to view their login history`  
    
6. Open a pull request against `develop` and make sure the title follows the same format as the commit message.


Two reviews from members of the Cloud Manager team are required before merge. After approval, all pull requests are squash merged.
