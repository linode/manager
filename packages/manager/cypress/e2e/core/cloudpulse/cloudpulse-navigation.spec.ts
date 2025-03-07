/**
 * @file Integration tests for Moniter navigation.
 */

import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';

import { accountFactory } from 'src/factories';

const mockAccount = accountFactory.build();

describe('Moniter navigation', () => {
  beforeEach(() => {
    mockGetAccount(mockAccount).as('getAccount');
  });

  /*
   * - Confirms that Moniter navigation item is shown when feature flag is enabled.
   * - Confirms that clicking Moniter navigation item directs user to Moniter landing page.
   */
  it('can navigate to moniter landing page', () => {
    mockAppendFeatureFlags({
      aclp: {
        beta: true,
        enabled: true,
      },
    }).as('getFeatureFlags');

    cy.visitWithLogin('/linodes');
    cy.wait('@getFeatureFlags');

    cy.get('[data-testid="menu-item-Metrics"]').should('be.visible').click();
    cy.url().should('endWith', '/metrics');
  });

  /*
   * - Confirms that moniter navigation item is not shown when feature flag is disabled.
   */
  it('does not show moniter navigation item when feature is disabled', () => {
    mockAppendFeatureFlags({
      aclp: {
        beta: true,
        enabled: false,
      },
    }).as('getFeatureFlags');

    cy.visitWithLogin('/linodes');
    cy.wait('@getFeatureFlags');

    ui.nav.find().within(() => {
      cy.get('[data-testid="menu-item-Metrics"]').should('not.exist');
    });
  });

  /*
   * - Confirms that manual navigation to metrics landing page with feature is disabled displays Not Found to user.
   */
  it('displays Not Found when manually navigating to /metrics with feature flag disabled', () => {
    mockAppendFeatureFlags({
      aclp: {
        beta: true,
        enabled: false,
      },
    }).as('getFeatureFlags');

    cy.visitWithLogin('/metrics');
    cy.wait('@getFeatureFlags');

    cy.findByText('Not Found').should('be.visible');
  });

  /*
   * - Confirms that manual navigation to the 'Alert' page on the Moniter landing page is disabled, and users are shown a 'Not Found' message..
   */
  it('should display "Not Found" when navigating to alert definitions with feature flag disabled', () => {
    mockAppendFeatureFlags({
      aclp: { beta: true, enabled: false },
    }).as('getFeatureFlags');

    // Attempt to visit the alert definitions page for a specific alert using a manual URL
    cy.visitWithLogin('/alerts');

    // Wait for the feature flag to be fetched and applied
    cy.wait('@getFeatureFlags');

    // Assert that the 'Not Found' message is displayed, indicating the user cannot access the page
    cy.findByText('Not Found').should('be.visible');
  });

  /*
   * - Confirms that manual navigation to the 'Alert Definitions Detail' page on the Moniter landing page is disabled, and users are shown a 'Not Found' message..
   */
  it('should display "Not Found" when manually navigating to alert details with feature flag disabled', () => {
    mockAppendFeatureFlags({
      aclp: { beta: true, enabled: false },
    }).as('getFeatureFlags');

    // Attempt to visit the alert detail page for a specific alert using a manual URL
    cy.visitWithLogin('/alerts/definitions/detail/dbaas/20000');

    // Wait for the feature flag to be fetched and applied
    cy.wait('@getFeatureFlags');

    // Assert that the 'Not Found' message is displayed, indicating the user cannot access the page
    cy.findByText('Not Found').should('be.visible');
  });
});