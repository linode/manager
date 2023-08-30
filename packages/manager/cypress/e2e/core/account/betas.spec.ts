/**
 * @file Integration tests for Betas landing page.
 */

import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { ui } from 'support/ui';

// TODO Delete feature flag mocks when feature flag is removed.
describe('Betas landing page', () => {
  /*
   * - Confirms that Betas nav item is present when feature is enabled.
   * - Confirms that Betas nav item redirects to Betas landing page.
   * - Confirms that Betas landing page is accessible.
   */
  it('can navigate to Betas landing page', () => {
    mockAppendFeatureFlags({
      selfServeBetas: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('/linodes');
    cy.wait(['@getFeatureFlags', '@getClientStream']);

    ui.nav.findItemByTitle('Betas').should('be.visible').click();

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
      selfServeBetas: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('/betas');
    cy.wait(['@getFeatureFlags', '@getClientStream']);

    cy.findByText('Not Found').should('be.visible');

    ui.nav.find().within(() => {
      cy.findByText('Betas').should('not.exist');
    });
  });
});
