# Getting Started

## Using the getting_started.sh script

1. Open the terminal application
2. Paste this into the terminal appliation `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/linode/manager/develop/scripts/getting_started.sh)"`
3. Press `Enter` to run the command
4. The script will ask you to enter your password. This is likely the same password you use to login to your computer.
5. Follow the prompts the scripts presents.

## Manually

1. Fork this repository.
2. Clone your fork to your local machine.
3. Go to [cloud.linode.com/profile/clients](https://cloud.linode.com/profile/clients) and click "Add an OAuth App".
4. Enter a label and set the callback URL to `http://localhost:3000/oauth/callback`.
5. After your OAuth App has been created, copy the ID (not the secret).
6. In `packages/manager`, copy the contents of `.env.example` and paste them into a new file called `.env`.
7. In `.env` set `REACT_APP_CLIENT_ID` to the ID from step 5.
8. Install Node.js 18.14.1. We recommend using [Volta](https://volta.sh/):

   ```bash

   $ curl https://get.volta.sh | bash

   ## Add volta to your .*rc file, or open a new terminal window.

   $ volta install node@18.14.1

   $ node --version
   ## v18.14.1

   ```

9. Install the latest version of Yarn:

   ```bash
       $ npm install --global yarn --upgrade
       # 1.22.10
   ```

10. Navigate to the root directory of the repository, then start Cloud Manager and the JS client with `yarn up`.
11. After installation, Cloud Manager should be running at `http://localhost:3000`.

## Serving a production build of Cloud Manager

You can then serve these files however you prefer or use our included local http server.

```bash
yarn install:all

yarn workspace linode-manager build

yarn workspace linode-manager run start:ci
```

## Exposing Cloud Manager's dev server to the network

By default, Cloud Manager's dev server only listens on `localhost`. If you need to
expose the Vite dev server, you can use the following command.

> **Note**: This is useful for running Cloud Manager's dev server in Docker-like environments

```bash
yarn up:expose
```
