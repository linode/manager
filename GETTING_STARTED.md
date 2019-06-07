# Running Cloud Manager Locally

Keep in mind these instructions assume you already have an account with Linode.com. If you do not have an account, [please create one here.](https://login.linode.com/signup)

## Creating a Client ID

The first step in getting the Manager running locally is to create an OAuth Client.
[You can create one here.](https://cloud.linode.com/profile/clients) On this screen, click _Create an OAuth App_

![Screen Shot 2019-04-10 at 2 47 57 PM](https://user-images.githubusercontent.com/7387001/55906071-69899f80-5ba1-11e9-85cd-bfd1a5e90eb8.png)

Once the drawer opens up, open the values below and click _Submit_

<img width="477" alt="Screen Shot 2019-04-11 at 10 18 01 AM" src="https://user-images.githubusercontent.com/7387001/55964735-3992d880-5c43-11e9-9975-4b22c52b3115.png">

Finally, keep the client ID in the table row handy. You'll need it later:

![Screen Shot 2019-04-10 at 3 04 02 PM](https://user-images.githubusercontent.com/7387001/55906313-fc2a3e80-5ba1-11e9-8f8a-6323649c301d.png)


## Creating an `.env` file

Please refer to the [`.env.example` file](.env.example) in this directory. This will get you started in creating you own `.env` file so you can run the Manager.

Here are a list of all the required and optional environment variables the Manager leverages:

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

`REACT_APP_ALGOLIA_APPLICATION_ID`: The ID that matches with the Algolia index

`REACT_APP_SEARCH_KEY`: The search key that matches with the Algolia index

`REACT_APP_SENTRY_URL`: The URL to a configured Sentry environment

`REACT_APP_GA_ID`: The ID that matches with a configured Google Analytics property

`REACT_APP_GTM_ID`: The ID that matches with a configured Google Tag Manager property

`REACT_APP_ACCESS_TOKEN`: Access Token that overrides the token recieved from the Login service.
e.g `Bearer 1232313` or `Admin 1231423`

`REACT_APP_DISABLE_EVENT_THROTTLE`: <Boolean> Whether the app should poll the `/events` endpoint at provided intervals

### Testing Variables

These are environment variables that can be used for automated testing processes

`MANAGER_USER`: Username of the account on which end-to-end tests should run

`MANAGER_PASS`: Password of the account on which end-to-end tests should run

`MANAGER_OAUTH`: OAuth Token of the account on which end-to-end tests should run

## Running the App

Running the app requires a working [Node environment](https://nodejs.org/en/) to be installed. We recommend you
install some version greater than `8.11.2`

We are also utilizing [Yarn](https://www.google.com/search?q=yarn&oq=yarn&aqs=chrome..69i57j69i60l2j69i61j69i59l2.520j0j7&sourceid=chrome&ie=UTF-8) in this project, so be sure to install the latest stable version.

Once these dependencies are installed, run the following command

`yarn && yarn start`

alternatively, with Docker

`yarn && yarn docker:local`

At this point, the app should load on `localhost:3000` and you should be prompted to login and then can start browsing the app.

