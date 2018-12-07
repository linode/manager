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
* [WebdriverIO](https://webdriver.io/)

## Setup

    git clone https://github.com/Linode/manager.git
    cd manager
    node --version # should be Node 8 LTS
    brew install yarn # on mac
    yarn

##### Setup w/Docker
    git clone https://github.com/Linode/manager.git
    cd manager
    docker build -f Dockerfile . -t 'linode-manager'


This application communicates with Linode via the
[Linode APIv4](https://developers.linode.com). You'll need to [register an OAuth
client](https://cloud.linode.com/profile/tokens), then create a file in the base
of the manager repository entitled `.env` with the following variables/values:

    REACT_APP_CLIENT_ID='CHANGE_ME'
    REACT_APP_LOGIN_ROOT='https://login.linode.com'
    REACT_APP_API_ROOT='https://api.linode.com/v4'
    REACT_APP_APP_ROOT='http://localhost:3000'

Be sure to set your callback URL to something like
`http://localhost:3000/oauth/callback` when you register your OAuth client.

For convenience, an example `.env` file entitled: `.env.example` exists in the base
of this repository.

Note: if you pick a callback url that is not on localhost:3000, you will need to
update the REACT_APP_APP_ROOT variable in `.env` to point to the different
server. Non-localhost callback urls must also be HTTPS. To enable HTTPS, you must
also include `HTTPS='true'` in your `.env` file.

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

Or, using Docker:

    docker run --rm -p 3000:3000 -v $(pwd)/src:/src/src linode-manager start

    ## If you have installed yarn,
    ## you can call the following convenience script:

    yarn docker:local

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

We use [pre-commit](https://www.npmjs.com/package/pre-commit) to run linting and testing on commit. If either fail the commit will be aborted. Address the reported issues, stage the changes, and attempt the commit again. This behaviour can be skipped using the
`--no-verify` flag.

In general, the following flows apply.

When creating a new feature:
1. `git checkout develop`
2. `git checkout -b my-feature-name`
3. stage and commit changes to your feature branch
4. `yarn lint` # to lint your code
5. `yarn test` # to test your code
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
1. run `yarn release ${release version} ${release date yyyy.MM.dd}`, this will create the release branch and update changelog. (Note: make sure to stage any work, the script will clear working tree)
2. review changelog, update manually if necessary
3. `yarn version --new-version ${release version}` # bump a minor or major version, updating both the `package.json` and `yarn-shrinkwrap.json`
4. stage and commit the version bump and changelog addition commit message 'v${release version}'
5. delete the previous release branch
9. push the release git push ${manager remote}  && git push --tags ${manager remote}
10. open a pull request against testing for the release (to be merged with "Create a Merge Commit" (--no-ff))
10. after the pull request is approved and merged testing=>staging=>master, follow up to make sure a release is tagged in github against master.
Copy relative changes from the [CHANGELOG.md](https://github.com/linode/manager/blob/master/CHANGELOG.md) into the release description.

**Tip**: set up your local git repository to lint before every commit.
```sh
echo '#!/usr/bin/env bash' > .git/hooks/pre-commit
echo 'yarn lint' >> .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Testing
This project uses [Jest](https://facebook.github.io/jest/docs/en/api.html) for unit testing, snapshot testing, assertions, and mocking. [Sinon](http://sinonjs.org/) is still found throughout the project, however is being phased out in favor of Jest mocking.

End-to-end tests are written using WebdriverIO. More documentation on running these tests can be found in the testing [docs](/TESTING.md)

### Naming
Test files are collocated with their target file and are suffixed "spec.js" (ie `myFile.js` and `myFile.spec.js`).

### Commands
To run tests:

    yarn test
    yarn test:watch

To test a specific file or files found in a  folder:

    yarn test MyFile.spec.js
    yarn test src/some-folder

### Coverage Reporting
We haven't assigned an artibrary coverage requirement. Coverage and testing are tools. Make good decisions.

To generate a coverage report:

    yarn test --coverage

## Testing React Components

React Components are testable using [storybook](https://github.com/storybooks/storybook). To access
the manager storybook:

    yarn storybook

Or, using Docker:

    docker build -f Dockerfile . -t 'storybook'
    docker run -it --rm -p 6006:6006 -v $(pwd)/src:/src/src storybook storybook

    ## If you have installed yarn,
    ## you can call the following convenience script:

    yarn docker:storybook

## Coding Style

The manager is written in ES6, with some ES7 in use as well. A general guideline
for the coding style is "imitate the code that's already there". When in doubt,
apply the [Airbnb style guide](https://github.com/airbnb/javascript) or just let
the linter do its thing.

## Dependencies

This project relies on a number of third-party dependencies. It us important that when importing those
dependencies you import only the necessary files. For example, if I needed to create an Observable
using RxJS I would import only Observable and the type of Observable I want to create. This keeps bundle
size down substantially.
```
## Good
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

## Bad
import { Observable } from 'rxjs/Rx';
```
Additionally we order imports alphabetically within certain blocks. The blocks are;
```
/** Third Party Libs /**
import * as React from 'react';

/** Material UI Imports /**
import { WithStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

/** Source Components /**
import { getLinodes } from 'src/services/linodes';

/** Relative Imports /**
import something from '../some/where/nearby';
```


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

## Generating the changelog
Get a Python 3 installation with pip. On a Mac

`brew install python` (Python 3 is now the default)

The changelog is generated by the script generate_changelog.py, this script can only run once a local release branch has been created.

The script accepts 3 parameters ${release version} ${release date yyyy.MM.dd} ${mangerRemote}

Does a git log diff of manager/master...HEAD, printing only the commit subject. Strips any reference to a jira ticket, and disregards any testing or automation ticket, and updates the CHANGELOG.md Added, Breaking, Fixed, Change based on keywords in the commit subject.

### References
- http://nvie.com/posts/a-successful-git-branching-model/
- http://keepachangelog.com/en/0.3.0/
- https://help.github.com/articles/merging-a-pull-request/
- https://help.github.com/articles/about-pull-request-merges/
