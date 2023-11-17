# GitHub Workflows

This directory contains the GitHub Actions workflows that power continuous integration and end-to-end testing for Linode Cloud Manager.

## Continuous Integration
The `ci` workflow handles testing, building, and publishing of packages in this repository. Tests are run using [Vitest](https://vitest.dev/) for `api-v4` and `manager`.

If the continuous integration workflow was triggered via a push to the `master` branch, the built packages are published:

* `api-v4` and `validation` are published to [npm](https://www.npmjs.com/)
* `manager` is published to [cloud.linode.com](https://cloud.linode.com)

### Triggers
* Upon push to `master` branch
* Upon pull request creation

### Secrets
| Name                  | Description                                       |
|-----------------------|---------------------------------------------------|
| AWS_ACCESS_KEY_ID     | AWS access key, or equivalent                     |
| AWS_S3_BUCKET         | Name of S3 bucket where Cloud Manager is deployed |
| AWS_SECRET_ACCESS_KEY | AWS secret access key, or equivalent              |
| NPM_AUTH_TOKEN        | NPM authentication token for package publishing   |
| SLACK_WEBHOOK         | Webhook for Slack CI notifications                |
| STORYBOOK_BUCKET      | Name of S3 bucket where Storybook is deployed     |

## End-to-End Tests
Automatic end-to-end testing of Linode Cloud Manager via [Cypress](https://www.cypress.io/) is handled by the `Run Tests On PR` and `Run Tests On Push/Schedule` workflows. These two workflows are very similar, and differ primarily in how they are triggered.

End-to-end tests are run automatically for the `develop` branch each weekday at 8:00 AM ET, and are triggered any time code is pushed to the `develop`, `staging`, and `master` branches. Tests also run for pull requests authored by Cloud Manager team members.

Cypress tests are parallelized across four containers, and tests are automatically distributed among containers for optimal performance. To avoid race conditions, each test container is authenticated with its own test user account.

### Triggers
* Scheduled, 1:00 PM UTC (8:00 AM ET) every Monday through Friday for `develop` branch
* Upon push to `develop`, `staging`, and `master` branches
* Upon creation or update to any pull request authored by a Cloud Manager team member

### Secrets
| Name                       | Description                               |
|----------------------------|-------------------------------------------|
| USER_1                     | Cloud Manager OAuth token for test user 1 |
| USER_2                     | Cloud Manager OAuth token for test user 2 |
| USER_3                     | Cloud Manager OAuth token for test user 3 |
| USER_4                     | Cloud Manager OAuth token for test user 4 |
| REACT_APP_LAUNCH_DARKLY_ID | LaunchDarkly API key                      |
| REACT_APP_CLIENT_ID        | Linode OAuth app client ID                |
| REACT_APP_API_ROOT         | Linode API root URL                       |
| REACT_APP_APP_ROOT         | Linode Cloud Manager instance root URL    |
| CYPRESS_RECORD_KEY         | Cypress Dashboard project record key      |

## See Also
* [_Understanding GitHub Actions_](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions) (`docs.github.com`)
* [_Introduction to Cypress_](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress) (`docs.cypress.io`)
* [Cypress: _GitHub Actions_](https://docs.cypress.io/guides/continuous-integration/github-actions#Cypress-GitHub-Action) (`docs.cypress.io`)
* [Cypress: _Parallelization_](https://docs.cypress.io/guides/guides/parallelization) (`docs.cypress.io`)
* [Vitest: _Getting Started_](https://vitest.dev/guide/) (`vitest.dev`)
