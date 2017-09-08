# Contributing to the Linode manager

Contributing just involves sending a pull request. You will probably be more
successful with your contribution if you visit the [IRC
channel](https://webchat.oftc.net/?channels=linode-next&uio=d4) upfront and discuss
your plans.

The following buzzwords are involved in this project:

* [React.js](https://facebook.github.io/react/)
* [Redux](http://redux.js.org/)
* [Webpack](https://webpack.github.io/)
* ES6/ES7 (via [Babel](https://babeljs.io/))
* [SCSS](http://sass-lang.com)
* [Yarn](https://yarnpkg.com/)

## Setup

    git clone https://github.com/Linode/manager.git
    cd manager
    node --version # should be 6.x - 7.2.1
    (cd components && yarn link) # brew install yarn # on mac
    yarn link linode-components
    yarn

This application communicates with Linode via the
[Linode APIv4](https://developers.linode.com). You'll need to [register an OAuth
client](https://cloud.linode.com/profile/tokens), then create a file at
`src/secrets.js` with your client ID and client secret set appropriately:

    export const clientId = 'change me';
    export const clientSecret = 'change me';

Be sure to set your callback URL to something like
`http://localhost:3000/oauth/callback` when you register your OAuth client.

Note: if you pick a callback url that is not on localhost:3000, you will need to
update the APP_ROOT variable in src/constants.js to point to the different
server.

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
for comments to the [(#linode-next channel on irc.oftc.net)](https://webchat.oftc.net/?channels=linode-next&uio=d4).

## Development

Run:

    yarn start

to start the development server. Connect to
[localhost:3000](https://localhost:3000) to try it out. Most of the changes you
make will be applied on the fly, but you may occasionally find that you have to
restart it.

While running the manager in development mode, you may press Ctrl+H to view the
redux dev tools to track the state of the application, and Ctrl+Q to move them
around the screen if necessary. If you'd rather disable the devtools, you can
set the NODE_ENV flag to "production" or set the DEVTOOLS_DISABLED flag to false:

    DEVTOOLS_DISABLED=true yarn start

## Git workflows

We are doing our best to follow [a successful git branching model](http://nvie.com/posts/a-successful-git-branching-model/)

In addition, updates should be accompanied by a [CHANGELOG.md](https://github.com/linode/manager/blob/master/CHANGELOG.md). 
See [Keepachangelog](http://keepachangelog.com/en/0.3.0/) for formatting details

In general, the following flows apply.

When creating a new feature:
1. `git checkout develop`
2. `git checkout -b my-feature-name`
3. stage and commit changes to your feature branch
4. `yarn run lint` # to lint your code
5. `yarn test` # to test your code, see 
6. `git push -u your-remote my-feature-name` # push to your remote and --set-upstream-to
7. `git checkout develop` and `git pull origin develop` # make sure you're up to date
8. `git rebase develop` or `git rebase -i develop` # rebase and cleanup your changes if desired
9. `git push -f` # push your rebased feature to your remote 
10. open a pull request against origin develop

Updating your fork's develop from origin:
1. `git pull origin develop`

Updating your fork's develop from origin with conflicts:
1. `git pull -X theirs origin develop` # assuming you don't have new changes on your fork's develop

Creating a hotfix:
1. `git checkout master`
2. `git pull origin master`
3. `git checkout -b hf-v0.9.1` # create a hotfix branch
4. stage and commit your hotfix change
5. `yarn --no-git-tag version patch` # bump a patch version, updating both the `package.json` and `TODO: lockfile`
6. Manually update the [CHANGELOG.md](https://github.com/linode/manager/blob/master/CHANGELOG.md) to represent changes for the patch version
7. stage and commit the version bump and changelog addition
8. `git push -u your-remote hf-v0.9.1`
9. open a pull request against master for the hotfix (to be merged with "Create a Merge Commit" (--no-ff))
10. open a pull request against develop for the hotfix (to be merged with "Create a Merge Commit" (--no-ff))
10. after the pull request is approved and merged, follow up to make sure a release is tagged in github against master. 
Copy relative changes from the [CHANGELOG.md](https://github.com/linode/manager/blob/master/CHANGELOG.md) into the release description.

Creating a release candidate:
1. `git checkout develop`
2. `git pull origin develop` # make sure your local develop is up to date
3. `git checkout -b rc-v0.9.0` # create a release candidate branch
4. stage and commit your hotfix change
5. `yarn --no-git-tag version minor|major` # bump a minor or major version, updating both the `package.json` and `yarn-shrinkwrap.json`
6. Manually update the [CHANGELOG.md](https://github.com/linode/manager/blob/master/CHANGELOG.md) to represent changes for the version
7. stage and commit the version bump and changelog addition
8. `git push -u your-remote rc-v0.9.0`
9. open a pull request against master for the release (to be merged with "Create a Merge Commit" (--no-ff))
10. open a pull request against develop for the release (to be merged with "Create a Merge Commit" (--no-ff))
10. after the pull request is approved and merged, follow up to make sure a release is tagged in github against master. 
Copy relative changes from the [CHANGELOG.md](https://github.com/linode/manager/blob/master/CHANGELOG.md) into the release description.

**Tip**: set up your local git repository to lint before every commit.
```sh
echo '#!/usr/bin/env bash' > .git/hooks/pre-commit
echo 'yarn run lint' >> .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Testing

To run tests:

    yarn test

To automatically re-run tests when you make changes:

    yarn run test:watch
    
To automatically re-run tests on a single test file:

    yarn run test:watch --single_file=**/name.spec.js

Our tests live in test/**.spec.js. They're based on
[Mocha](https://mochajs.org/) and do assertions with
[Chai](http://chaijs.com/) plus DOM/React testing with
[enzyme](http://airbnb.io/enzyme/). We run them with
[Karma](https://karma-runner.github.io/1.0/index.html).
We're aiming for 95%+ test coverage.

## Coding Style

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

### References
- http://nvie.com/posts/a-successful-git-branching-model/
- http://keepachangelog.com/en/0.3.0/
- https://help.github.com/articles/merging-a-pull-request/
- https://help.github.com/articles/about-pull-request-merges/
