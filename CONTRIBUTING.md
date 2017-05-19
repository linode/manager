# Contributing to the Linode manager

Contributing just involves sending a pull request. You will probably be more
successful with your contribution if you visit the [IRC
channel](https://webchat.oftc.net/?channels=linode-next&uio=d4) upfront and discuss
your plans.

## Development Flow

Changes to the Linode Manager usually follow this flow:

1. If required, make a mockup
1. Review and approve the mockup with peers (and sometimes stakeholders)
1. Implement the change, with tests
1. Merge the change

This usually requires two GitHub issues: the design issue, and the
implementation issue. But some may not require the initial design issue.

We label issues as "ready" when one of our developers has committed to
resolving it during the current 1-2 week sprint. You're welcome to take these on
if you want, but we might finish it first. We merge pull requests on a
first-come-first-serve basis; the first PR that adequately solves the problem
will be merged.

## Making design changes

Mockups are necessary when making changes to the existing look and feel or when
adding features/elements/components that don't have a clear precedent. If this
is the case, you will need to submit an issue with a mockup and send a request
for comments to the #linode-api IRC channel on Freenode.

## Making pull requests

When you start working on a feature, do this:

1. git fetch upstream
1. git checkout -b add-so-and-so-feature upstream/master
1. do work awesomely
1. Run `npm run lint` to lint your code and `npm test` to test your code
1. git push -u origin add-so-and-so-feature
1. Make pull request from your feature branch

**Tip**: set up your local git repository to lint before every commit.

```sh
echo "#!/usr/bin/env bash" > .git/hooks/pre-commit
echo "npm run lint" >> .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Coding Style

The manager is written in ES6, with some ES7 in use as well. A general guideline
for the coding style is "imitate the code that's already there". When in doubt,
apply the [Airbnb style guide](https://github.com/airbnb/javascript) or just let
the linter do its thing.

## Reporting Bugs

First, remember that this is a work in progress. Please don't report bugs for
features that aren't present, links that lead to 404's, buttons that don't
appear to do anything - these are all likely in-progress or not started
features. Instead, report bugs for regressions or problems with things that are
already implemented. Please ask on IRC or search the GitHub issues to see if
there's already a bug filed for your problem - if so, leave a comment
mentioning that you can reproduce it. Otherwise, go ahead and open an issue
with as much detail as you can provide (for example: node version, operating
system, browser, device, etc.). Thanks!

## Releasing
### Creating a release branch:
A release branch is composed of 1 or more features that have been merged into master.

1. git checkout master
2. git pull origin master // make sure you have latest
3. npm install && npm start // update packages and manually check to see that the app is in good state
4. git checkout -b release-0.5.0 // create a new release branch with the planned version change
5. npm --no-git-tag-version version patch|minor|major // bump the version in the package.json
6. Manually update CHANGELOG.md to represent changes for the release version
7. Stage and commit your changes
8. git push -u {your_fork_origin} release-0.5.0
9. Open a pull: linode/master < {your_fork_origin}/release-0.5.0 for review
10. Approve/Merge pull against master w/ "Create a merge commit"
11. Open a pull: linode/release < {your_fork_origin}/release-0.5.0 for review
12. Approve/Merge pull against release w/ "Create a merge commit"
13. Create a release via github (v0.5.0) against linode/release, Copy CHANGELOG.md details for the version into the release description
14. Publish release
15. Notify in chat [(#linode-next on irc.oftc.net)](https://webchat.oftc.net/?channels=linode-next&uio=d4) that release is complete, coordinate deploy
16. After deploy, manually check that the app is in the expected state. See testing doc.

### Creating a hotfix branch:
A hotfix branch is for bug fixes against the current release.

1. git checkout release
2. git pull origin release
3. npm install && npm start // update packages and manually check to see that the app is in good state
4. git checkout -b HF-0.5.1
5. Add and commit your hotfix
6. npm --no-git-tag-version version patch
7. Manually update CHANGELOG.md to represent changes for the release version
8. Stage and commit your changes
9. Open a pull: linode/release < {your_fork_origin}/release-0.5.1 for review
10. Approve/Merge pull against release w/ "Squash and Merge"
11. Open a pull: linode/master < {your_fork_origin}/release-0.5.1 for review
12. Approve/Merge pull against master w/ "Squash and Merge"
13. Create a release via github (v0.5.1) against linode/release, Copy CHANGELOG.md details for the version into the release description
14. Publish release
15. Notify in chat [(#linode-next on irc.oftc.net)](https://webchat.oftc.net/?channels=linode-next&uio=d4) that release is complete, coordinate deploy
16. After deploy, manually check that the app is in the expected state. See testing doc.

### References
- http://nvie.com/posts/a-successful-git-branching-model/
- https://docs.npmjs.com/cli/version
- http://keepachangelog.com/en/0.3.0/
- https://help.github.com/articles/merging-a-pull-request/
- https://help.github.com/articles/about-pull-request-merges/
