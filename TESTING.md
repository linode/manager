# Testing Linode Manager

## Unit Tests

The unit tests for Linode Cloud Manager are written in Typescript using the [Jest](https://facebook.github.io/jest/) testing framework. Unit tests end with the `.test.tsx` file extension and can be found throughout the codebase.

To run tests:

```
yarn && npx lerna bootstrap --scope linode-manager && npx lerna run test --stream --scope linode-manager
```

Or you can run the tests in watch mode with:

```
yarn && npx lerna bootstrap --scope linode-manager && npx lerna run test --stream --scope linode-manager -- --watch
```

To Run a specific file or files in a directory:

```
npx lerna run test --stream --scope linode-manager -- myFile.test.tsx
npx lerna run test --stream --scope linode-manager -- src/some-folder
```

Jest includes pattern matching out of the box, so you can also do things like run all tests whose filename
contains "Linode" with

```
npx lerna run test --stream --scope linode-manager -- linode
```

To run a test in debug mode, add a `debugger` breakpoint inside one of the test cases, then run

```
npx lerna run test:debug --stream --scope linode-manager
```

Test execution will stop at the debugger statement, and you will be able to use Chrome's normal debugger to step through
the tests (open `chrome://inspect/#devices` in Chrome).

## End-to-End Tests

End-to-end Testing of the Linode Cloud Manager can be done locally by running Selenium & WebdriverIO tests
alongside the local development environment, or by running multiple containers via docker-compose.

The Cloud Manager application has a suite of automated browser tests that live in the `packages/manager/e2e/specs`
directory. These browser tests are written in Node.js using the [WebdriverIO](https://webdriver.io)
selenium framework. The configuration files for the WDIO test runner can be found in `packages/manager/e2e/config`.

Prior to running the tests, you must set `MANAGER_USER=` and `MANAGER_PASS` env variables in your
`packages/manager/.env` file. These credentials will be used to login prior to each test.


##### Dependencies

* Java JDK 12
```bash
brew cask uninstall java
brew tap caskroom/versions
brew cask install java
```
* Node.js 10 LTS (`brew install node@10`)
* Google Chrome v60+ (`brew cask install google-chrome`)
* Yarn  (`brew install yarn`)

#### Run Suite
```
## Starts the local development environment

yarn && npx lerna bootstrap --scope linode-manager && npx lerna run start --stream --scope linode-manager

## New shell
## Starts selenium (Must be running to execute tests)

npx lerna run selenium --scope linode-manager --stream

## New shell
## Executes specs matching e2e/specs/**/*.spec.js

npx lerna run e2e --scope linode-manager --stream
```

### Command Line Arguments

The `npx lerna run e2e` command accepts a number of helpful command line arguments that facilitate
writing and running tests locally.

Running an individual spec file:

```
npx lerna run e2e --scope linode-manager --stream -- --file [/path/to/test.spec.js]
```

Running E2E suite in a non-default browser

```
npx lerna run e2e --scope linode-manager --stream -- --browser [chrome,firefox,headlessChrome,safari]
```

#### Run Suite in Docker Local Dev Environment

##### Dependencies

* Docker v18+
* Docker-Compose v1.20.1+

##### Prerequisites

In order to run the tests via docker-compose, you will need to update your OAuth Client Redirect URL
to: `https://manager-local:3000/oauth/callback`. The recommendation is to generate a new OAuth
client in the [Manager](https://cloud.linode.com), set the redirect url to the above, and set the
`REACT_APP_CLIENT_ID=` to the new OAuth Client ID in the `packages/manager/.env` file. You must also set
`MANAGER_USER=` and `MANAGER_PASS` env variables in your `packages/manager/.env` file. These credentials will be used
to login prior to each test.

##### Running the Suite

```
docker-compose -f integration-test.yml up --build --exit-code-from manager-e2e

# OR if Yarn is installed:

yarn docker:e2e
```


# Testing React Storybook Components

In addition to the Linode Manager E2E tests, there are also UI tests for the ReactJS components.
The components are tested via [Storybook](https://github.com/storybooks/storybook) and the test specs
live in `src/components/ComponentName/ComponentName.spec.js`. The WDIO config lives in `e2e/config/wdio.storybook.conf.js`

##### Dependencies

* Same as Testing Manager

#### Run Suite

```
# Starts storybook

npx lerna run storybook --scope linode-manager --stream

## New shell
## Starts selenium (Must be running to execute tests)

npx lerna run seleniun --scope linode-manager --stream

## New shell
## Executes specs matching src/components/**/*.spec.js

npx lerna run storybook:e2e --scope linode-manager --stream
```

#### Run a Single Test
```
# Executes spec matching src/components/StoryName/StoryName.spec.js

npx lerna run storybook:e2e --scope linode-manager --stream -- --story StoryName
```

#### Run a Test in Non-Headless Chrome

```
npx lerna run seleniun --scope linode-manager --stream

## New Shell
## The --debug flag spawns a visible chrome session

npx lerna run storybook:e2e --scope linode-manager --stream -- --debug --story StoryName
```

#### Run Suite in Docker Environment

##### Dependencies

* Same as Testing Manager

##### Running the Suite

```
docker-compose -f integration-test.yml up --build --exit-code-from manager-e2e

# OR if Yarn is installed:

yarn docker:e2e
```

# Accessibility Testing

The axe-core accessibility testing script has been integrated into the webdriverIO-based testing framework to enable automated accessibility testing. At present, the script merely navigates to all routes described in `packages/managere2e/constants.js`, loads the page and runs the accessibility tests.

##### Dependencies

* Same as E2E Manager tests

#### Run Suite

```
# Starts the local development environment

yarn && npx lerna bootstrap --scope linode-manager && npx lerna run start --stream --scope linode-manager


npx lerna run axe --stream --scope linode-manager
```

The test results will be saved as a JSON file with Critical accessibility violations appearing at the top of the list.
