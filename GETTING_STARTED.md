# Getting Started

1. Fork this repository, then clone your fork to your local machine.
2. Go to [cloud.linode.com/profile/clients](https://cloud.linode.com/profile/clients) and click "Add an OAuth App". Enter a label and set the callback URL to `http://localhost:3000/oauth/callback`. Once the app has been created, copy the ID (not the secret).
3. In `packages/manager` , copy the contents of `.env.example` and paste them into a new file called `.env`. Set `REACT_APP_CLIENT_ID` to the ID from step 2.\
4. Install Node.js v14.15.4. We recommend using [Node Version Manager](https://github.com/nvm-sh/nvm) (nvm):

```bash

$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

## Add nvm to your .*rc file, or open a new terminal window.

$ nvm install 14.15.4

$ node --version
## v14.15.4

```

5. Install the latest version of Yarn:

```bash
$ npm install --global yarn --upgrade
# 1.22.4
```

6. Navigate to the root directory of the repository, then start Cloud Manager and the JS client with `yarn up`.
7. After installation, Cloud Manager should be running at http://localhost:3000.

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
