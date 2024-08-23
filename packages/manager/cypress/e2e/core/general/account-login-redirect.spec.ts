import { mockApiRequestWithError } from 'support/intercepts/general';
import { LOGIN_ROOT } from 'src/constants';

describe('account login redirect', () => {
  /**
   * The API will return 401 with the body below for all the endpoints.
   *
   * { "errors": [ { "reason": "Your account must be authorized to use this endpoint" } ] }
   */
  it('should redirect to the login page when the user is not authorized', () => {
    const errorReason = 'Your account must be authorized to use this endpoint';

    mockApiRequestWithError(401, errorReason);

    cy.visitWithLogin('/linodes/create');

    cy.url().should('contain', `${LOGIN_ROOT}/login?`, { exact: false });
    cy.findByText('Please log in to continue.').should('be.visible');
  });
});
