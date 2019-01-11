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

Prior to running the tests, you must set `MANAGER_USER=` and `MANAGER_PASS` env variables in your
`.env` file. These credentials will be used to login prior to each test.


##### Dependencies

* Java JDK 8
```bash
brew cask uninstall java
brew tap caskroom/versions
brew cask install java8
```
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
`REACT_APP_CLIENT_ID=` to the new OAuth Client ID in the `.env` file. You must also set
`MANAGER_USER=` and `MANAGER_PASS` env variables in your `.env` file. These credentials will be used
to login prior to each test.

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

#### Run a Single Test

    yarn storybook:e2e --story StoryName # Executes spec matching src/components/StoryName/StoryName.spec.js

#### Run a Test in Non-Headless Chrome

    yarn selenium

    ## New Shell

    yarn storybook:e2e --debug --story StoryName # The --debug flag spawns a visible chrome session

#### Run Suite in Docker Environment

##### Dependencies

* Same as Testing Manager

##### Running the Suite

    docker-compose -f integration-test.yml up --build --exit-code-from manager-e2e

    # OR if Yarn is installed:

    yarn docker:e2e


# Accessibility Testing

The axe-core accessibility testing script has been integrated into the webdriverIO-based testing framework to enable automated accessibility testing. At present, the script merely navigates to all routes described in `e2e/constants.js`, loads the page and runs the accessibility tests.

##### Dependencies

* Same as E2E Manager tests

#### Run Suite

     yarn && yarn start # Starts the local development environment
     yarn axe

The test results will be saved as a JSON file with Critical accessibility violations appearing at the top of the list.

##### Visual Regression

##### Dependencies

* Same as Run Suite in Docker Local Dev Environment

The visual regression has been integrated into the webdriverIO-based testing framework to enable visual diff testing. Using webdriverIO screenshots to take snap shots of specific portions of the DOM (i.e. taking snapshots of individual components not entire page), and ResemmbleJS to compare screenshots to our baseline expected images, and Mountebank to mock api data. Results are published using Allure html reporter, if there are discrepancies between the screenshots and baseline the test is marked as failed and the report will display the expected image, the actual image, and a heat map of the difference between the images.

The suite requires an additional argument in the dot .env file:

     VISUAL_REGRESSION

If set to true, then comparison between snap shots and baseline take place, if set to false then just the baseline images are updated.

To run the suite, ensure these values are set in your .env file:

     VISUAL_REGRESSION
     MANAGER_USER
     MANAGER_PASS
     MANAGER_USER_2
     MANAGER_PASS_2

Once the values are set run the command:

     yarn docker:e2e:visual-regression

After the suite is complete, and html report will display displaying the results.
