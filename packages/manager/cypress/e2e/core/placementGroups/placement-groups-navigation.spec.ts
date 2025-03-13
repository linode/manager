/**
 * @file Integration tests for Placement Groups navigation.
 */

import { mockGetAccount } from 'support/intercepts/account';
import { ui } from 'support/ui';

import { accountFactory } from 'src/factories';

const mockAccount = accountFactory.build();

describe('Placement Groups navigation', () => {
  // Mock User Account to include Placement Group capability
  beforeEach(() => {
    mockGetAccount(mockAccount).as('getAccount');
  });

  /*
   * - Confirms that clicking Placement Groups navigation item directs user to Placement Groups landing page.
   */
  it('can navigate to Placement Groups landing page', () => {
    cy.visitWithLogin('/linodes');

    ui.nav.findItemByTitle('Placement Groups').should('be.visible').click();
    cy.url().should('endWith', '/placement-groups');
  });

  /*
   * - Confirm navigation patterns to the create drawer
   */
  it('can navigate to a placement group details page', () => {
    cy.visitWithLogin('/placement-groups');

    ui.button
      .findByTitle('Create Placement Group')
      .should('be.visible')
      .click();
    cy.url().should('endWith', '/placement-groups/create');

    ui.drawer
      .findByTitle('Create Placement Group')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByAttribute('aria-label', 'Close drawer')
          .should('be.visible')
          .click();
      });

    cy.url().should('endWith', '/placement-groups');
  });
});
