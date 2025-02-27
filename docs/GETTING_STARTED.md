# Getting Started

1. Fork this repository.
2. Clone your fork to your local machine.
3. Go to [cloud.linode.com/profile/clients](https://cloud.linode.com/profile/clients) and click "Add an OAuth App".
4. Enter a label, set the callback URL to `http://localhost:3000/oauth/callback`, and check the "Public" checkbox.
5. After your OAuth App has been created, copy the ID (not the secret).
6. In `packages/manager`, copy the contents of `.env.example` and paste them into a new file called `.env`.
7. In `.env` set `REACT_APP_CLIENT_ID` to the ID from step 5.
8. Install Node.js 20.17 LTS. We recommend using [Volta](https://volta.sh/):

   ```bash
   curl https://get.volta.sh | bash

   ## Add volta to your .*rc file, or open a new terminal window.

   volta install node@20.17

   node --version
   ## v20.17.0
   ```

9. Install pnpm v10 using Volta or view the [pnpm docs](https://pnpm.io/installation) for more installation methods

   ```bash
   volta install pnpm@10

   pnpm --version
   # 10.2.0
   ```

10. Navigate to the root directory of the repository
11. Run `pnpm bootstrap` to install dependencies and perform an initial build of our packages
12. Run `pnpm dev` to start the local development server. Cloud Manager should be running at `http://localhost:3000`

## Serving a production build of Cloud Manager

You can build a production bundle of Cloud Manager and serve it locally.

```bash
pnpm install

pnpm run --filter @linode/validation build # build the @linode/validation package

pnpm run --filter @linode/api-v4 build # build the @linode/api-v4 (it depends on @linode/validation)

pnpm run --filter linode-manager build # build a production bundle of Cloud Manager

pnpm run --filter linode-manager start:ci # start a local http server on http://localhost:3000/
```

## Exposing Cloud Manager's dev server to the network

By default, Cloud Manager's dev server only listens on `localhost`. If you need to
expose the Vite dev server to all network interfaces, you can use the following command.

> **Note**: This is useful for running Cloud Manager's dev server in Docker-like environments

```bash
pnpm run up:expose
```
