# Commands available in this repo

## yarn

We use Yarn for this repository (v1.21 and above), with NodeJs v8 and above (tested and working on NodeJs v12).
For NodeJs we recommend using [`nvm`](https://github.com/nvm-sh/nvm)

### yarn.lock

There is one yarn lock in this repo at the root level, this is like `package-lock.json` for npm users.

**This file is committed** it ensures we use the same exact version of the packages in CI.

**DO NOT USE `yarn`** to install dependencies, this will modify the `yarn.lock`.
=> Use `yarn install:all`, which includes the `--frozen-lockfile` flag to prevent unnecessary changes to yarn.lock.

**We use Workspaces** as explained in our [GETTING STARTED](./GETTING_STARTED.md) guide.

#### Change a dependency version, and the `yarn.lock`

The best way is usually to modify manually the `package.json` in the correct workspace (root, linode-manager or linode-js-sdk).
Then runing `yarn`.
this should update the lockfile with only the required changes.

Although if `yarn` noticed other dependency it could fix warnings on it will do it implicitly.
While this is a good behavior from yarn, we want to keep the diff on a PR as focused and short as possible to facilitate review.
So consider that if you have a lot of changes in your `yarn.lock` you may want to separate things in different PR.

**If you see that 1 new dependency you added included a lot of subdependencies, with older versions of the dependencies we already have, check that the new package is not outdated**

### running commands

#### In general

Prefer `yarn run` over `npx`

`yarn run <command>` will execute a command in the root workspace.
`yarn run workspace <workspace> run <command>` to execute it in a specific project.

Built-in commands do not require `run`.

In the case of `yarn add` running it in the root directory will issue a warning, this is normal and just to make sure that you want to install the dependency there and not in one of the workspaces. (you need to add `-W` to ignore it)

#### package.json commands

`yarn install:all`: installs dependencies, without touching the lock.
`yarn postinstall`: is called automatically after any `yarn install`, applies patches to the packages installed.
`yarn clean`: removes all dependencies installed (equivalent to `rm -rf node_modules`).

`yarn build` builds the SDK and the production build of the Cloud Manager. Add the `--analyze` flag to produce a report of the bundle size and content in `packages/manager/bundle_analyzer_report.html`.
`yarn build:sdk`: builds the SDK.

`yarn start:all`: starts the development server on `localhost:3000` with hot reload enabled (both SDK and Manager).
`yarn up` installs everything, builds the sdk, runs `yarn start:all`

`yarn test`: runs the unit tests (with a fresh clone of the repo you must run `yarn build:sdk` before running the tests)
`yarn cy:e2e`: runs the e2e tests (you must have the app served on `localhost:3000` with `yarn up`)
`yarn storybook:e2e`: runs the storybook tests (you must have the storybook server started with `yarn storybook`)

More on testing commands in [testing docs](./TESTING.md)
