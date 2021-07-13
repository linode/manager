# Getting Started

## Using the getting_started.sh script
1. Open the terminal application
2. Paste this into the terminal appliation `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/codyfinn/manager/M3-5119-startup-script/getting_started.sh)"`
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
8. Install Node.js 14.15.4. We recommend using [Node Version Manager](https://github.com/nvm-sh/nvm) (nvm):

    ```bash

    $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

    ## Add nvm to your .*rc file, or open a new terminal window.

    $ nvm install 14.15.4

    $ node --version
    ## v14.15.4

    ```

9. Install the latest version of Yarn:

    ```bash
        $ npm install --global yarn --upgrade
        # 1.22.10
    ```

10. Navigate to the root directory of the repository, then start Cloud Manager and the JS client with `yarn up`.
11. After installation, Cloud Manager should be running at http://localhost:3000.

## Serving a production build of Cloud Manager:

Since Cloud Manager was generated using Create React App, `yarn build` can be used to generate an optimized production bundle:

```bash

    yarn install:all

    yarn workspace linode-manager build

```

You can then serve these files however you prefer, for example, with [http-server](https://www.npmjs.com/package/http-server):

```bash

    npm install -g http-server

    cd packages/manager/build

    http-server .

```
