import { apiMatcher } from 'support/util/intercepts';

describe('account activation', () => {
  /**
   * The API will return 403 with the body below for most endpoint except `/v4/profile`.
   *
   * { "errors": [ { "reason": "Your account must be activated before you can use this endpoint" } ] }
   */
  it('should render an activation landing page if the customer is not activated', () => {
    cy.intercept('GET', apiMatcher('*'), {
      statusCode: 403,
      body: {
        errors: [
          {
            reason:
              'Your account must be activated before you can use this endpoint',
          },
        ],
      },
    });

    cy.visitWithLogin('/');

    cy.findByText('Your account is currently being reviewed.');
    cy.findByText('open a support ticket', { exact: false });
  });
});
