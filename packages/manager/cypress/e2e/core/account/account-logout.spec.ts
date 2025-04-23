import { loginBaseUrl } from 'support/constants/login';
import { interceptGetAccount } from 'support/intercepts/account';
import { ui } from 'support/ui';

describe('Logout Test', () => {
  beforeEach(() => {
    cy.tag('purpose:syntheticTesting', 'method:e2e');
  });

  /*
   * - Confirms that Cloud Manager log out functionality works as expected.
   * - Confirms that the login application is up after account logout.
   */
  it('can logout the account and redirect to login endpoint', () => {
    interceptGetAccount().as('getAccount');

    cy.visitWithLogin('/account');
    cy.wait('@getAccount');

    // User can click Logout via user menu.
    ui.userMenuButton.find().click();
    ui.userMenu
      .find()
      .should('be.visible')
      .within(() => {
        cy.findByText('Log Out').should('be.visible').click();
      });
    // Upon clicking "Log Out", the user is redirected to the login endpoint at <REACT_APP_LOGIN_ROOT>/login
    cy.url().should('equal', `${loginBaseUrl}/login`);
    // Using cy.visit to navigate back to Cloud results in another redirect to the login page
    cy.visit('/');
    cy.url().should('startWith', `${loginBaseUrl}/login`);
  });
});
