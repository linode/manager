# Configuring Your Environment

 Cloud Manager's environment is configured by the `packages/manager/.env` file. The `packages/manager/.env.example` file provides some documentation on the minimal configuration required to run Cloud Manager.

 ## Multiple Environments

 You can define multiple environments in Cloud Manager by using the pattern shown in the code snippet below. You can switch between these environments by using Cloud Manager's dev tools located in the bottom left hand corner of the browser.

```sh
# Provide a base environment
COMPUTE_LOGIN_ROOT='https://login.linode.com'
COMPUTE_API_ROOT='https://api.linode.com/v4'
COMPUTE_APP_ROOT='http://localhost:3000'
COMPUTE_CLIENT_ID='...'

# Provide any extra variables to be appled to every environment
COMPUTE_API_MAX_PAGE_SIZE='200'
COMPUTE_LAUNCHDARKLY_CLIENT_ID='...'
COMPUTE_SENTRY_URL='...'

# Define environments that can be switched between
COMPUTE_DEV_TOOLS_ENV_1_LABEL="Prod"
COMPUTE_DEV_TOOLS_ENV_1_API_ROOT='https://api.linode.com/v4'
COMPUTE_DEV_TOOLS_ENV_1_LOGIN_ROOT='https://login.linode.com'
COMPUTE_DEV_TOOLS_ENV_1_CLIENT_ID='...'

COMPUTE_DEV_TOOLS_ENV_2_LABEL='Staging'
COMPUTE_DEV_TOOLS_ENV_2_API_ROOT='...'
COMPUTE_DEV_TOOLS_ENV_2_LOGIN_ROOT='...'
COMPUTE_DEV_TOOLS_ENV_2_CLIENT_ID='...'

COMPUTE_DEV_TOOLS_ENV_3_LABEL='Dev'
COMPUTE_DEV_TOOLS_ENV_3_API_ROOT='...'
COMPUTE_DEV_TOOLS_ENV_3_LOGIN_ROOT='...'
COMPUTE_DEV_TOOLS_ENV_3_CLIENT_ID='...'
```
