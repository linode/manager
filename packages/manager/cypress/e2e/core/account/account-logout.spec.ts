import { LOGIN_ROOT } from 'src/constants';
import { interceptGetAccount } from 'support/intercepts/account';

describe('Logout Test', () => {
  beforeEach(() => {
    cy.tag('purpose:syntheticTesting');
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
    cy.findByTestId('nav-group-profile').click();
    cy.findByTestId('menu-item-Log Out')
      .should('be.visible')
      .should('be.enabled')
      .click();
    // Upon clicking "Log Out", the user is redirected to the login endpoint at <REACT_APP_LOGIN_ROOT>/login
    cy.url().should('equal', `${LOGIN_ROOT}/login`);
    // Using cy.visit to navigate back to Cloud results in another redirect to the login page
    cy.visit('/login');
    cy.url().should('endWith', `/login`);
  });
});
