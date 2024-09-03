/**
 * @file Integration tests for Placement Groups navigation.
 */

import { mockGetAccount } from 'support/intercepts/account';
import { accountFactory } from 'src/factories';
import { ui } from 'support/ui';

const mockAccount = accountFactory.build();

describe('Placement Groups navigation', () => {
  // Mock User Account to include Placement Group capability
  beforeEach(() => {
    mockGetAccount(mockAccount).as('getAccount');
  });

  /*
   * - Confirms that Placement Groups navigation item is shown when feature flag is enabled.
   * - Confirms that clicking Placement Groups navigation item directs user to Placement Groups landing page.
   */
  it('can navigate to Placement Groups landing page', () => {
    cy.visitWithLogin('/linodes');

    ui.nav.findItemByTitle('Placement Groups').should('be.visible').click();
    cy.url().should('endWith', '/placement-groups');
  });

  /*
   * - Confirms that Placement Groups navigation item is not shown when feature flag is disabled.
   */
  it('does not show Placement Groups navigation item when feature is disabled', () => {
    cy.visitWithLogin('/linodes');

    ui.nav.find().within(() => {
      cy.findByText('Placement Groups').should('not.exist');
    });
  });

  /*
   * - Confirms that manual navigation to Placement Groups landing page with feature is disabled displays Not Found to user.
   */
  it('displays Not Found when manually navigating to /placement-groups with feature flag disabled', () => {
    cy.visitWithLogin('/placement-groups');
    cy.findByText('Not Found').should('be.visible');
  });
});
