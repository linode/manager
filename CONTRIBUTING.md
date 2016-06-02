# Contributing to the Linode manager

Contributing just involves sending a pull request. You will probably be more
successful with your contribution if you visit the [IRC
channel](https://webchat.oftc.net/?channels=linode-next&uio=d4) upfront and discuss
your plans.

## Making Pull Requests

If you already have your own pull request habits, feel free to use them. If you
don't, however, allow me to make a suggestion: feature branches pulled from
upstream. Try this:

1. Fork manager
1. Clone your fork
1. git remote add upstream git://github.com/Linode/manager.git

You only need to do this once. You're never going to use your fork's master
branch. Instead, when you start working on a feature, do this:

1. git fetch upstream
1. git checkout -b add-so-and-so-feature upstream/master
1. work
1. git push -u origin add-so-and-so-feature
1. Run `npm run lint` to lint your code and `npm test` to test your code
1. Make pull request from your feature branch

**Tip**: automatically lint your commits by running this snippet:

    printf '%s\n%s' '#!/usr/bin/env bash' 'npm run lint' > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

### Coding Style

The manager is written in ES6, with some ES7 in use as well. A general guideline
for the coding style is "imitate the code that's already there". If in doubt,
apply the [Airbnb style guide](https://github.com/airbnb/javascript).

## Reporting Bugs

Don't.
