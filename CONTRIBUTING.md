# Contributing to the Linode manager

Contributing to the Cloud Manager just involves sending a Pull Request.

The following buzzwords are involved in this project:

* [React.js](https://facebook.github.io/react/)
* [Redux](http://redux.js.org/)
* [Webpack](https://webpack.github.io/)
* [Material-UI](https://material-ui.com/)
* ES6/ES7 (via [Babel](https://babeljs.io/))
* [Yarn](https://yarnpkg.com/)
* [WebdriverIO](https://webdriver.io/)

## Development

### Coding Style

The manager is written in ES6, with some ES7 in use as well. A general guideline
for the coding style is "imitate the code that's already there". When in doubt,
apply the [Airbnb style guide](https://github.com/airbnb/javascript) or just let
the linter do its thing.

If you're interested in learning how we write code and want to follow our guidelines, please
see our [code style documentation.](CODE_STYLE.md)

### Testing
This project uses [Jest](https://facebook.github.io/jest/docs/en/api.html) for unit testing, snapshot testing, assertions, and mocking.

End-to-end tests are written using WebdriverIO.

For everything related to writing and running tests, [please see the documentation here.](TESTING.md)

## Git workflows

### Creating and Committing to a New Branch

When creating a new feature, you should attempt to create a descriptive branch name. All branch names must be prefixed with `M3`, which stands for Manager 3, as this is the third iteration of this product.

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

### Deploying

We are following a CI/CD (continuous integration / continuous deployment) process for Cloud Manager. This means:
1. `develop` branch gets automatically deployed to our development environment
2. `testing` branch gets automatically deployed to our testing environment
3. `staging` branch gets automatically deployed to our staging environment
4. `master` branch gets automatically deployed to our production environment, AKA https://cloud.linode.com

This means we can deploy features quickly and efficiently.

When a new version of Cloud Manager is released, it must be accompanied by an update to [CHANGELOG.md](https://github.com/linode/manager/blob/master/CHANGELOG.md). See [Keepachangelog](http://keepachangelog.com/en/0.3.0/) for formatting details

#### What to Do When Releasing

NOTE: These instructions assume your upstream is called `origin`

These instructions assume you have your local branches configured so that the upstream is set to their
remote counterpart. If you haven't done so already, run the following commands.

* `git checkout origin/testing && git checkout -b testing && git branch --set-upstream-to origin/testing`
* `git checkout origin/staging && git checkout -b staging && git branch --set-upstream-to origin/staging`
* `git checkout origin/master && git checkout -b master && git branch --set-upstream-to origin/master`

When you plan on releasing a new version of Cloud Manager:

1. Pull down the latest `testing` and `develop` branches locally
    * `git checkout develop && git pull && git checkout testing && git pull`
2. Merge develop into testing with `git checkout testing && git merge develop`
    * This should result in 0 merge conflicts
3. While `testing` branch is checked out, [generate the Changelog](#generating-the-changelog) first
4. Review the Changelog and update manually if necessary
    * This includes getting rid of any references to PR numbers, JIRA ticket numbers or grammar and spelling mistakes
    * You should also ensure that everything in the Chaneglog is user-facing. Removing anything that users won't directly be interacting with
5. Once your Changelog has been approved by the team, run `git add . && yarn version --new-version X.X.X` (replace the X's with the appropriate version number)
    * This will apply the Git tags and update the version number in the `package.json`
    * This will also automatically commit the changes with the commit message `vX.X.X`
6. Push the changes from your local `testing` branch to the upstream with `git push origin testing`
    * You may need to add the `--no-verify` flag, as the `testing` branch isn't prefixed with `M3`
7. At last, follow the merge flow as normal
    * Merge `testing` into `staging` with `git checkout staging && git pull && git merge testing && git push origin staging`
    * Merge `staging` into `master` with `git checkout master && git pull && git merge staging && git push origin master` 
8. After the new version has been released, create a new branch from `develop` branch and cherry-pick the release commit from `master` branch into your new branch
9. Then, open a PR to merge that branch into `develop` branch to update the release
10. Finally, on GitHub, create a new release from the Git tag you've just pushed to `master` branch

### Generating the changelog
Get a Python 3 installation with `pip`. On a Mac:

`brew install python` (Python 3 is now the default)

The Changelog is generated by the script `generate_changelog.py`. This script should ideally only be run on the `testing` branch

The script accepts 3 parameters:
1. `${release version}`
    * `vX.X.X` for example
2. `${release-date yyyy.MM.dd}`
    * `2019-09-17` for example
3. `${mangerRemote}`
    * `origin` for example

So altogether, the command should look like:

```
python generate_changelog.py v0.52.0 2019-09-17 origin
```

This script does a git log diff of manager/master...HEAD, printing only the commit subject. Strip any reference to a JIRA ticket, and disregards any testing or automation ticket, and updates the CHANGELOG.md Added, Breaking, Fixed, Change based on keywords in the commit subject.

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
