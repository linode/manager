# Contributing to Linode UI

Contributing to Linode UI just involves sending a Pull Request.

The following buzzwords are involved in this project, so please familiarize yourself with them before contributing:

* [React.js](https://facebook.github.io/react/)
* [Redux](http://redux.js.org/)
* [Webpack](https://webpack.github.io/)
* [Material-UI](https://material-ui.com/)
* ES6/ES7 (via [Babel](https://babeljs.io/))
* [Yarn](https://yarnpkg.com/)
* [WebdriverIO](https://webdriver.io/)

## Requirements

In order to contribute to Linode UI, we recommend the following minimum version numbers:

1. Git v2.19.1
2. Node v10.16.0
3. Yarn 1.16.0

You must also have [Lerna](https://lerna.js.org/) installed globally, so please run the following to install the package to your local machine:

```
yarn global add lerna
```

## Development

### Coding Style

The JavaScript code located in this project is written in ES6, with some ES7 in use as well. A general guideline for the coding style is "imitate the code that's already there". When in doubt,
apply the [Airbnb style guide](https://github.com/airbnb/javascript) or just let
the linter do its thing.

If you're interested in learning how we write code and want to follow our guidelines, please
see our [code convention documentation.](CODE_CONVENTIONS.md).

### Testing
Some projects, such as the Cloud Manager, use [Jest](https://facebook.github.io/jest/docs/en/api.html) for unit testing, snapshot testing, assertions, and mocking.

End-to-end tests are written using WebdriverIO.

For everything related to writing and running tests, [please see the documentation here.](TESTING.md)

## Git workflows

### Creating and Committing to a New Branch

When creating a new feature, you should attempt to create a descriptive branch name. All branch names must be prefixed with `M3`, which stands for Manager 3, as this is the third iteration of the Cloud Manager.

For example `M3-my-cool-feature`

Once you have made all your changes, you can commit them.

We use [Husky](https://github.com/typicode/husky) to perform the following tasks before the commit succeeds:

1. Linting
2. Unit testing
3. [Storybook](https://github.com/storybooks/storybook) end-to-end component testing
4. [Circular dependency check](https://github.com/pahen/madge)
5. Type Checking (as we're using TypeScript in the src code)

 If any fail the commit will be aborted. Address the reported issues, stage the changes, and attempt the commit again. This behavior can be skipped using the
`--no-verify` flag, but we highly suggest you do _**not**_ use this flag.

### Merge Conflicts

Merge conflicts happen, and when they do, we recommend rebasing.

`git rebase -i develop` will allow you to interactively pick which commits you want to keep and then you can address the conflicts as they appear.

If you absolutely must merge the two branches, that is fine as we will squash all commits once the PR is merged, so we aren't that stressed about merge commits.

## Other Things

### Reporting Bugs

First, remember that this is a work in progress. Please don't report bugs for
features that aren't present, links that lead to 404's, buttons that don't
appear to do anything - these are all likely in-progress or not started
features. Instead, report bugs for regressions or problems with things that are
already implemented. Please search GitHub issues to see if
there's already a bug filed for your problem - if so, leave a comment
mentioning that you can reproduce it. Otherwise, go ahead and open an issue
with as much detail as you can provide (for example: node version, operating
system, browser, device, etc.). Thanks!

### References
- http://keepachangelog.com/en/0.3.0/
- https://help.github.com/articles/merging-a-pull-request/
- https://help.github.com/articles/about-pull-request-merges/
