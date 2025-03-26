/**
 * @file Integration tests for VPC navigation.
 */

import { ui } from 'support/ui';
import { mockGetUserPreferences } from 'support/intercepts/profile';

describe('VPC navigation', () => {
  /*
   * - Confirms that VPC navigation item is shown when feature is enabled.
   * - Confirms that clicking VPC navigation item directs user to VPC landing page.
   */
  it('can navigate to VPC landing page', () => {
    // Ensure that the Primary Nav is open
    mockGetUserPreferences({ desktop_sidebar_open: false }).as(
      'getPreferences'
    );

    cy.visitWithLogin('/linodes');

    ui.nav.findItemByTitle('VPC').should('be.visible').click();
    cy.url().should('endWith', '/vpcs');
  });
});
