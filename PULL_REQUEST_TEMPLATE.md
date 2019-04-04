## Description

Please start the pull request title with the jira ticket corresponding to the work if applicable. Please include a short summary of the feature added, the change, or issue fixed.

## Type of Change
- Bug fix ('fix', 'repair', 'bug')
- Non breaking change ('update', 'change')
- Breaking change ('break', 'deprecate')

If the any above types of change apply to this pull request, please ensure to include one of the listed keywords in the pull request title.

## Applicable E2E Tests

To run relevant E2E tests, run these commands in 3 separate terminals:

1. `yarn && yarn start`
2. `yarn selenium`
3. `yarn e2e --spec=COMMA_SEPARATED_LIST_OF_SPECS_HERE --browser=headlessChrome`

## Note to Reviewers

Please describe the tests that you ran to verify your changes. Provide instructions so we can reproduce. Please also list any relevant details for your test configuration.
