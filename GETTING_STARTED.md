# Contributing to Linode UI

This document explains the instructions for setting up Linode UI locally, step-by-step. 

## Preface

This repository uses [Yarn Workspaces](https://legacy.yarnpkg.com/lang/en/docs/workspaces/), a solution to transform JavaScript-based repositories
into one, combined monorepo. This is useful because it allows us to maintain multiple different projects in one place, with shared dependencies.

There is 3 `package.json` files, 1 for the root, and one for each folder in `packages/`. running `yarn` will install everything, and "hoist" as much as possible in the root `node_modules` folder. There is also 1 unique `yarn.lock` at the root.

Most of the time you will directly use the commands from this documentation. If you have to run a specific command the rule is:
- To run a command in both sub packages `yarn workspace <command>`
- To run a command in 1 subpackage `yarn workspace linode-js-sdk <command>`, or `yarn workspace linode-manager <command>`

Note the workspace names are defined in the root `package.json`
- linode-js-sdk: /packages/linode-js-sdk
- linode-js-sdk: /packages/linode-manager

## Starting All Projects

If your intention is to start a development server for all projects, you have a few different options. First, we recommend checking out the [creating an OAuth client](./CREATE_CLIENT.md) and [creating an .env file for Cloud Manager](./CLOUD.md) docs, as you'll most likely need an OAuth Client and `.env` file for projects such as the Cloud Manager.

To start all projects:

While in the root...
1. Run `yarn install:all` to install all dependencies
2. Run `yarn start:all` to start a development server for all projects

Alternatively, you can run `yarn up` which runs all previous commands.

## Starting a Single Project

Starting a single project is similar to the previous instructions with the exception of adding a `--scope` flag to to the command. So for example, starting the Cloud Manager project looks like:

1. Run `yarn install:all` to install all dependencies
2. Run `yarn workspace linode-js-sdk start` to start a development server for the JavaScript SDK
   * `linode-js-sdk` is the name located in `packages/linode-js-sdk/package.json`

### To do the same thing with Yarn

You can write a command like this:
`yarn workspace linode-js-sdk run start`

Or in the case of the manager
`yarn workspace linode-manager run start`

## Testing
See [this document](./TESTING.md)

## Helper Scripts

* `yarn clean` is an alias that will remove both top-level and package-level `node_modules`.
* `yarn test` is an alias that will run a test suite in the Cloud Manager project
  * `yarn test packages/manager/src/App.test.tsx` for example

## Okay. I've got my development server running. So how do I contribute?

Please see our [contributing](./CONTRIBUTING.md) and [code conventions](./CODE_CONVENTIONS.md) guides for instructions on how to get started with contributing to this project.


## Just serving the built app
### legacy solution
You can use the command `yarn docker:local` which will build a container based on the `Dockerfile` and starts the manager server. *this operation is slow*

### Better solution
Although, you can also do it with a small nginx container.
You probably already have done this.
```bash
yarn install:all
yarn build
```
Just start a small nginx container
```bash
yarn start:nginx
```