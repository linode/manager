/**
 * @file Integration tests for Betas landing page.
 */

import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { ui } from 'support/ui';

// TODO Delete feature flag mocks when feature flag is removed.
beforeEach(() => {
  cy.tag('method:e2e');
});
describe('Betas landing page', () => {
  /*
   * - Confirms that Betas nav item is present when feature is enabled.
   * - Confirms that Betas nav item redirects to Betas landing page.
   * - Confirms that Betas landing page is accessible.
   */
  it('can navigate to Betas landing page', () => {
    mockAppendFeatureFlags({
      selfServeBetas: true,
    }).as('getFeatureFlags');

    // Ensure that the Primary Nav is open
    mockGetUserPreferences({ desktop_sidebar_open: false }).as(
      'getPreferences'
    );

    cy.visitWithLogin('/linodes');
    cy.wait('@getFeatureFlags');

    ui.nav
      .findItemByTitle('Betas')
      .scrollIntoView()
      .should('be.visible')
      .click();

    cy.url().should('endWith', '/betas');

    ui.heading.findByText('Betas').should('be.visible');
    cy.findByText('Available & Upcoming Betas').should('be.visible');
    cy.findByText('Beta Participation History').should('be.visible');
  });

  /*
   * - Confirms that Betas nav item is not present when feature is disabled.
   * - Confirms that Betas landing page is not accessible when feature is disabled.
   */
  it('cannot access Betas landing page when feature is disabled', () => {
    // TODO Delete this test when betas feature flag is removed from codebase.
    mockAppendFeatureFlags({
      selfServeBetas: false,
    }).as('getFeatureFlags');

    cy.visitWithLogin('/betas');
    cy.wait('@getFeatureFlags');

    cy.findByText('Not Found').should('be.visible');

    ui.nav.find().within(() => {
      cy.findByText('Betas').should('not.exist');
    });
  });
});
