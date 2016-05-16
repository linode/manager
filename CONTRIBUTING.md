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
2. Clone your fork
3. git remote add upstream git://github.com/Linode/manager.git

You only need to do this once. You're never going to use your fork's master
branch. Instead, when you start working on a feature, do this:

1. git fetch upstream
2. git checkout -b add-so-and-so-feature upstream/master
3. work
4. git push -u origin add-so-and-so-feature
5. Make pull request from your feature branch

### Coding Style

The manager is written in ES6, with some ES7 in use as well. A general guideline
for the coding style is "imitate the code that's already there". If in doubt,
apply the [Airbnb style guide](https://github.com/airbnb/javascript).

## Reporting Bugs

Don't.
