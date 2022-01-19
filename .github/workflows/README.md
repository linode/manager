# GitHub Workflows

This directory contains the GitHub Actions workflows that power continuous integration and end-to-end testing for Linode Cloud Manager.

## Continuous Integration
The `ci` workflow handles testing, building, and publishing of packages in this repository. Tests are run via [Jest](https://jestjs.io/) for `api-v4` and `manager`, but tests are not run for `validation`.

If the continuous integration workflow was triggered via a push to the `master` branch, the built packages are published:

* `api-v4` and `validation` are published to [npm](https://www.npmjs.com/)
* `manager` is published to [cloud.linode.com](https://cloud.linode.com)

### Triggers
* Upon push to `master` branch
* Upon pull request creation

## End-to-End Tests
Automatic end-to-end testing of Linode Cloud Manager via [Cypress](https://www.cypress.io/) is handled by the `Run Tests On PR` and `Run Tests On Push/Schedule` workflows. These two workflows are very similar, and differ primarily in how they are triggered.

End-to-end tests are run automatically for the `develop` branch each weekday at 8:00 AM ET, and are triggered any time code is pushed to the `develop`, `staging`, and `master` branches. However, tests are only performed for pull requests if the PR includes the `e2e` label.

Cypress tests are parallelized across four containers, and tests are automatically distributed among containers for optimal performance. To avoid race conditions, each test container is authenticated with its own test user account.

### Triggers
* Scheduled, 1:00 PM UTC (8:00 AM ET) every Monday through Friday for `develop` branch
* Upon push to `develop`, `staging`, and `master` branches
* Upon creation or update to any pull request with `e2e` label

## See Also
* [_Understanding GitHub Actions_](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions) (`docs.github.com`)
* [_Introduction to Cypress_](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress) (`docs.cypress.io`)
* [Cypress: _GitHub Actions_](https://docs.cypress.io/guides/continuous-integration/github-actions#Cypress-GitHub-Action) (`docs.cypress.io`)
* [Cypress: _Parallelization_](https://docs.cypress.io/guides/guides/parallelization) (`docs.cypress.io`)
* [Jest: _Getting Started_](https://jestjs.io/docs/getting-started) (`jestjs.io`)
