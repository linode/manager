# Using API Mocks for Development

## Setup

  In order to run your local Linode Manager client against mock services, you must first configure your `.env` file.

  Update your `REACT_APP_API_ROOT` environment variable to the following:

  ``` bash
  REACT_APP_API_ROOT=https://localhost:8088/v4
  ```

  This will update the API base URL to the mock service (powered by Mountebank). After doing this, be sure to restart your local manager client by running `yarn && yarn start`.

## Running the Mock API Service

  After configuring your `.env` file you are ready to start running a mock Linode API Service instance. Mock services are created using [Mountebank](http://mbtest.org). Run Mountebank via the following command from the Manager project directory:

  ``` bash
  yarn mb
  ```


  Mountebank acts as an orchestrator of mock services or "Imposter services" as it calls them. Mountebank controls the creation/tear down of our mock API service.

  We also use the Mountebank API to configure these services and give them a way to reason about the requests we give it. Mountebank's API allows us to configure **stubs.** Stubs take a request with a certain Method, Path, Body, and Query string and return something from it. To learn more, please familiarize yourself with [Mountebank's API docs](http://www.mbtest.org/docs/api/overview). There are many ways to create stub predicates (ways to match a request). This is helpful if you want to capture requests for e.g. a specific Linode or set of Linodes and return a specific response.


## Recording a Mock Session

  To record API calls for later use/manipulation, we have a small utility script that will tell Mountebank to create an imposter service that will proxy to `api.linode.com/v4`. Since your Manager client is already configured to make requests to this imposter service, no further configuration is necessary after running the following command:

  ```bash
  yarn mock --record # -r is also an avaialable flag
  ```

Refresh your Manager in your browser. You should see the app load as it normally would. If it does not, see the Common Issues section below.

  You are now using Mountebank's imposter to record all API calls made by the Manager. To verify your Mountebank API Imposter is receiving the requests, you can visit [this page](http://localhost:2525/imposters/8088). In it, you will see a **stub** that looks like this:

  ```JSON
      {
        "responses": [
        {
            "proxy": {
                "to": "https://api.linode.com/v4",
                "mode": "proxyAlways",
                "predicateGenerators": [
                {
                    "matches": {
                      "method": true,
                      "path": true,
                      "query": true,
                      "body": true
                  }
              }
              ],
              "injectHeaders": {
                  "Accept-Encoding": "identity"
              }
          }
      }
      ]
    }
  ```

  You should also see other stubs. These represent the requests made by the Manager that are now being forwarded to `api.linode.com/v4`. Mountebank keeps both the requests themselves and their responses. It saves these values in Mountebank's own API format for later usage (for creation of a service that returns responses based on matching request values).

## Saving a Mock Session File

  To save the requests/responses made during your session, you can use our mock tool again:

  ``` bash
  yarn mock --save nameOfMockFile.json
  ```

  This will send a GET request to `http://localhost:2525/imposters` on your Moutebank instance. It will then take the JSON payload returned and write them to a file called `nameOfMockFile.json` and save it to the directory `src/__data__/mocks`. Once saved, you can view this file, verify its contents, and manipulate any API calls that you wish to return differently when running your manager app against a mock session file.

  **NOTE**: If you are committing the mock session to the repo, FIND/REPLACE ANY mention of your username in the saved mock session file.

## Using Saved Mock Sessions

  What we are calling "mock files" are JSON files that contain configuration info for Mountebank imposters. Mock files tell Mountebank how to create imposters and what configuration to give them (Protocol, Port and most importantly, Stubs).

  To load a mock file, run the following command:

  ``` bash
  yarn mock --load nameOfMockFile.json
  ```

  This will look for the file `nameOfMockFile.json` in `src/__data__/mocks` and send a PUT request to `https://localhost:2525/imposters` (the Mountebank service) with the configuration provided for your imposter in `nameOfMockFile.json` this includes the stubbed requests/responses.

## Removing / Resetting Mock Sessions

  Whenever you are recording a new mock session or loading a saved mock session, you must remove any existing configuration. If you just started Mountebank via `yarn mb` and have not run the `record` or `load` configuration commands with the `yarn mock` helper, then you have not loaded a configuration yet and can ignore removing/resetting sessions.

  To reset/remove mock sessions, run the following command:

  ```bash
  yarn mock --rm
  ```

  This will send a DELETE request to `http://localhost:2525/imposters` removing all imposter services and their configurations.

  **NOTE**: if you ran Mountebank in record mode, you must first remove the "record" configuration by running `yarn mock --rm` before running `yarn mock --load nameOfMockFile.json`.

## Mock Utility Help

  For usage information and a list of available commands for the `yarn mock` utility script, run the following command:

  ```bash
  yarn mock --help
  ```


## Common Issues

> I ran `yarn mock --record` or `yarn mock --load nameOfMockFile.json` and now when i load my manager, nothing happens.

  First, check that you've configured your `.env` file as mentioned above and that you have restarted your Manager Client.

  If the problem persists, it's likely a SSL certificate issue. Open the developer tools in Chrome or whatever your browser of choice and navigate to the Network Activity tab. Check out the requests being made localhost:8088. Navigate to one of these requests in a browser tab, like `https://localhost:8088/v4/linodes/894889`. It may prompt you about the request being made to an address with an unverified certificate. Proceed anyway.

  Once you opt to "proceed anyway" go back to your local manager client that was giving you trouble. Refresh the page and you should see it load as expected.

> There's lots of junk in these mock files that do not pertain to the API calls I wish to manipulate for my mock session. Can I remove some of this junk?

That depends. Some API calls are needed and may affect the APP and give unexpected results when running on via the mock session. But other information is not essential. When running via a saved mock, any unmatched API calls will proxy to the production environment. So it's definitely possible to have a mock containing only the small number of calls you wish to manipulate, but this will take some trial/error of loading a mock, testing it on the front end, removing the mock, tweaking the mock file, then loading it again and checking the front end.