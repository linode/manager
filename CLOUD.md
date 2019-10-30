# Running the Cloud Manager Locally

## Creating an `.env` file

Please refer to the [`.env.example` file](./packages/manager/.env.example) in this directory. This will get you started in creating your own `.env` file so you can run the Manager.

:rotating_light: Your `.env` file should be located in the `packages/manager` directory before your local development server is started.

Here are a list of all the required and optional environment variables the Manager uses:

### Required Variables

`REACT_APP_APP_ROOT`: The root location where you will be running the app
* e.g. `http://localhost:3000`

`REACT_APP_LOGIN_ROOT`: The root location where users will authenticate
* e.g. `https://login.linode.com`

`REACT_APP_API_ROOT`: The root location where API requests will be made
* e.g. `https://api.linode.com/v4`

`REACT_APP_LISH_ROOT`: The root location of LISH, Linode's web-based console
* e.g. `webconsole.linode.com`

`REACT_APP_CLIENT_ID`: The Client ID you created above in the first step


### Optional Variables

`REACT_APP_ALGOLIA_APPLICATION_ID`: Client ID for Linode's Algolia account

`REACT_APP_SEARCH_KEY`: API key for Linode's Algolia account

`REACT_APP_SENTRY_URL`: The URL to a configured Sentry environment

`REACT_APP_GA_ID`: The ID that matches with a configured Google Analytics property

`REACT_APP_GTM_ID`: The ID that matches with a configured Google Tag Manager property

`REACT_APP_ACCESS_TOKEN`: Access Token that overrides the token received from the Login service.
e.g `Bearer 1232313` or `Admin 1231423`

`REACT_APP_DISABLE_EVENT_THROTTLE`: <Boolean> Whether the app should poll the `/events` endpoint at provided intervals

`REACT_APP_LOG_PERFORMANCE_METRICS`: Set to `'true'` to log performance metrics to the console. Only works in development mode (i.e. while running `yarn start`).

`REACT_APP_PAYPAL_ENV`: Set to `production` or `sandbox` to alter which Paypal environment is used
for making payments. Defaults to `production`.

### Testing Variables

These are environment variables that can be used for automated testing processes

`MANAGER_USER`: Username of the account on which end-to-end tests should run

`MANAGER_PASS`: Password of the account on which end-to-end tests should run

`MANAGER_OAUTH`: OAuth Token of the account on which end-to-end tests should run

## Running the App

Once you have a working `.env` file, you can run the following in the root of the project:

`yarn up` or `yarn up:manager`

alternatively, with Docker

`yarn docker:local`

At this point, the app should load on `localhost:3000` and you should be prompted to login and then can start browsing the app.
