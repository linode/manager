# Testing Linode Manager

## Unit Tests

The unit tests for Linode manager are written in Typescript using the [Jest](https://facebook.github.io/jest/) testing framework. Unit tests end with `.test.tsx` file extension and can be found throughout the codebase.

To run tests:

    yarn && yarn test

To Run a specific file or files in a directory:

    yarn test myFile.test.tsx
    yarn test src/some-folder


## End-to-End Tests

End-to-end Testing of the Linode Manager can be done locally by running Selenium & WebdriverIO tests
alongside the local development environment, or by running multiple containers via docker-compose.

The Manager application has a suite of automated browser tests that live in the `e2e/specs`
directory. These browser tests are written in Node.js using the [WebdriverIO](https://webdriver.io)
selenium framework. The configuration files for the WDIO test runner can be found in `e2e/config`.


##### Dependencies

* Java JDK 8+ (`brew cask install java`)
* Node.js 8 LTS (`brew install node@8`)
* Google Chrome v60+ (`brew cask install google-chrome`)
* Yarn  (`brew install yarn`)

#### Run Suite

     yarn && yarn start  # Starts the local development environment

     ## New shell

     yarn selenium  # Starts selenium (Must be running to execute tests)

     ## New shell

     yarn e2e  # Executes specs matching e2e/specs/**/*.spec.js

### Command Line Arguments

The `yarn e2e` command accepts a number of helpful command line arguments that faciliate
writing and running tests locally.

Running an individual spec file:

    yarn e2e --file [/path/to/test.spec.js]

Running E2E suite in a non-default browser

    yarn e2e -b [chrome,firefox,headlessChrome,safari]

#### Run Suite in Docker Local Dev Environment

##### Dependencies

* Docker v18+
* Docker-Compose v1.20.1+

##### Prerequisites

In order to run the tests via docker-compose, you will need to update your OAuth Client Redirect URL
to: `https://manager-local:3000/oauth/callback`. The recommendation is to generate a new OAuth
client in the [Manager](https://cloud.linode.com), set the redirect url to the above, and set the
`REACT_APP_CLIENT_ID=` to the new OAuth Client ID in the `.env` file.

##### Running the Suite

    docker-compose -f integration-test.yml up --build --exit-code-from manager-e2e

    # OR if Yarn is installed:

    yarn docker:e2e


# Testing React Storybook Components

In addition to the Linode Manager E2E tests, there are also UI tests for the ReactJS components.
The components are tested via [Storybook](https://github.com/storybooks/storybook) and the test specs
live in `src/components/ComponentName/ComponentName.spec.js`. The WDIO config lives in `e2e/config/wdio.storybook.conf.js`

##### Dependencies

* Same as Testing Manager

#### Run Suite

     yarn storybook  # Starts storybook

     ## New shell

     yarn selenium  # Starts selenium (Must be running to execute tests)

     ## New shell

     yarn storybook:e2e  # Executes specs matching src/components/**/*.spec.js

#### Run Suite in Docker Environment

##### Dependencies

* Same as Testing Manager

##### Running the Suite

    docker-compose -f integration-test.yml up --build --exit-code-from manager-e2e

    # OR if Yarn is installed:

    yarn docker:e2e
