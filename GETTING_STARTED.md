# Getting Started

Set up and run Linode's UI packages locally.

## Preface

This repository uses [Yarn Workspaces](https://legacy.yarnpkg.com/lang/en/docs/workspaces/), a solution to transform JavaScript-based repositories
into a single monorepo. This is useful because it allows us to maintain multiple projects in one place, with shared dependencies.

There are 3 `package.json` files: 1 for the root, and one for each folder in `packages/`. Running `yarn` will install everything, and "hoist" as much as possible into the root `node_modules` folder. There is a single `yarn.lock` in the root directory.

Most of the time you will directly use the commands from this documentation. If you have to run a specific command the rule is:

- To run a command in both packages: `yarn workspace <command>`
- To run a command in a single package `yarn workspace @linode/api-v4 <command>`, or `yarn workspace linode-manager <command>`

The workspace names are defined in the root `package.json`

- @linode/api-v4: `/packages/@linode/api-v4`
- linode-manager: `/packages/linode-manager`

## Starting the App locally

1. Fork or clone this repository.
2. Log into cloud.linode.com and [create an OAuth client](./CREATE_CLIENT.md).
3. [Create an .env file for Cloud Manager](./CLOUD.md) and place it in the `packages/manager` directory.
4. Make sure you are using a supported version of Node.js (14.5.4 is recommended). We recommend using [NVM](https://github.com/nvm-sh/nvm):

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/<NVM-LATEST-VERSION>/install.sh | bash
   ## Follow the instructions to add NVM to your .*rc file, or open a new terminal window
   nvm install 14.15.4
   nvm use 14.15.4
   node --version
   ## v14.15.4
   ```

5. Make sure you have a recent version of Yarn (1.22+):

   ```bash
   yarn --version
   npm install -g yarn --upgrade
   ```

6. Start Cloud Manager and the JS client with `yarn up`.

## Testing

See [this document](./TESTING.md)

## Helper Scripts and other commands

To learn more about the available commands read [COMMANDS](./COMMANDS.md)

## Okay. I've got my development server running. So how do I contribute?

Please see our [contributing](./CONTRIBUTING.md) and [code conventions](./CODE_CONVENTIONS.md) guides for instructions on how to get started with contributing to this project.

## Serving a Build of Cloud Manager:

### Using yarn build

Since Cloud Manager was generated using Create React App, `yarn build` can be used to generate an optimized production bundle:

```bash
yarn install:all
yarn workspace linode-manager build
```

You can then serve these files however you prefer, for example:

```bash
npm install -g http-server
cd packages/manager/build
http-server .
```

### Docker

We also provide two ways to serve the build app using Docker:

Build a container based on the `Dockerfile` and starts the manager server (_this operation is slow_):

```bash
yarn docker:local
```

Start a small NGINX container to serve the files:

```bash
yarn start:nginx
```
