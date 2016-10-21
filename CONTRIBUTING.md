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
