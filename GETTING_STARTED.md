# Contributing to Linode UI

This document explains the instructions for setting up Linode UI locally, step-by-step. 

## Preface

This repository uses [Lerna](https://lerna.js.org/), a solution to transform JavaScript-based repositories
into one, combined monorepo. This is useful because it allows us to maintain multiple different projects in one place, with shared dependencies.

You can assume that as long as you are `cd`ed into the root of this project, any [Lerna commands](https://github.com/lerna/lerna/tree/master/commands) are fair game. Feel free to start any individual package or multiple. but please keep in mind that if you plan on running the Cloud Manager locally, you'll want to start all projects.

## Starting All Projects

If your intention is to start a development server for all projects, you have a few different options. First, we recommend checking out the [creating an OAuth client](./CREATE_CLIENT.md) and [creating an .env file for Cloud Manager](./CLOUD.md) docs, as you'll most likely need an OAuth Client and `.env` file for projects such as the Cloud Manager.

To start all projects:

While in the root...
1. Run `yarn install:all` to install all dependencies and setup `lerna`
2. Run `yarn start:all` to start a development server for all projects

Alternatively, you can run `yarn up` which runs all previous commands.

## Starting a Single Project

Starting a single project is similar to the previous instructions with the exception of adding a `--scope` flag to to the command. So for example, starting the Cloud Manager project looks like:

1. Run `yarn install:all` to install all dependencies and setup `lerna`
2. Run `npx lerna run start --scope linode-js-sdk` to start a development server for the JavaScript SDK
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
  * Please note - this also bypasses the confirmation Lerna gives by default to delete package-level `node_modules`
* `yarn test` is an alias that will run a test suite in the Cloud Manager project
  * `yarn test packages/manager/src/App.test.tsx` for example

## Okay. I've got my development server running. So how do I contribute?

Please see our [contributing](./CONTRIBUTING.md) and [code conventions](./CODE_CONVENTIONS.md) guides for instructions on how to get started with contributing to this project.


