# Commands available in this repo

## yarn

We use Yarn for this repository (v1.21 and above), with NodeJs v8 and above (tested and working on NodeJs v12).
For NodeJs we recommend using [`nvm`](https://github.com/nvm-sh/nvm)

### yarn.lock

There is one yarn lock in this repo at the root level, this is like `package-lock.json` for npm users.

**This file is committed** it ensures we use the same exact version of the packages in CI.

**DO NOT USE `yarn`** to install dependencies, as this will modify the `yarn.lock`.
=> Use `yarn install:all`, which includes the `--frozen-lockfile` flag to prevent unnecessary changes to `yarn.lock`.

**We use Workspaces** as explained in our [GETTING STARTED](./GETTING_STARTED.md) guide.

#### Change a dependency version, and the `yarn.lock`

The best way is usually to manually modify the `package.json` in the correct workspace (root, linode-manager or @linode/api-v4),
then run `yarn`. This should update the lockfile with only the required changes.

If the resulting changes to `yarn.lock` are extensive (which can be the case if Yarn detects that it can resolve warnings in
subdependencies), consider pushing a separate PR with these changes so that individual PRs are kept small and manageable.

**If you see that 1 new dependency you added included a lot of subdependencies, with older versions of the dependencies we already have, check that the new package is not outdated**

### Running Commands

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
