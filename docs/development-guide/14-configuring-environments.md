---
parent: Development Guide
---

# Configuring Your Environment

 Cloud Manager's environment is configured by the `packages/manager/.env` file. The `packages/manager/.env.example` file provides some documentation on the minimal configuration required to run Cloud Manager.

 ## Multiple Environments

 You can define multiple environments in Cloud Manager by using the pattern shown in the code snippet below. You can switch between these environments by using Cloud Manager's dev tools located in the bottom left hand corner of the browser. 

```sh
# Provide a base environment
REACT_APP_LOGIN_ROOT='https://login.linode.com'
REACT_APP_API_ROOT='https://api.linode.com/v4'
REACT_APP_APP_ROOT='http://localhost:3000'
REACT_APP_CLIENT_ID='...'

# Provide any extra variables to be appled to every environment
REACT_APP_API_MAX_PAGE_SIZE='200'
REACT_APP_LAUNCH_DARKLY_ID='...'
REACT_APP_SENTRY_URL='...'

# Define environments that can be switched between
REACT_APP_DEV_TOOLS_ENV_1_LABEL="Prod"
REACT_APP_DEV_TOOLS_ENV_1_API_ROOT='https://api.linode.com/v4'
REACT_APP_DEV_TOOLS_ENV_1_LOGIN_ROOT='https://login.linode.com'
REACT_APP_DEV_TOOLS_ENV_1_CLIENT_ID='...'

REACT_APP_DEV_TOOLS_ENV_2_LABEL='Staging'
REACT_APP_DEV_TOOLS_ENV_2_API_ROOT='...'
REACT_APP_DEV_TOOLS_ENV_2_LOGIN_ROOT='...'
REACT_APP_DEV_TOOLS_ENV_2_CLIENT_ID='...'

REACT_APP_DEV_TOOLS_ENV_3_LABEL='Dev'
REACT_APP_DEV_TOOLS_ENV_3_API_ROOT='...'
REACT_APP_DEV_TOOLS_ENV_3_LOGIN_ROOT='...'
REACT_APP_DEV_TOOLS_ENV_3_CLIENT_ID='...'
```