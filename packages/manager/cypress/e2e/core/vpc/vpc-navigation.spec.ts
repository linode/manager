/**
 * @file Integration tests for VPC navigation.
 */

import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { ui } from 'support/ui';

// TODO Remove feature flag mocks when feature flag is removed from codebase.
describe('VPC navigation', () => {
  /*
   * - Confirms that VPC navigation item is shown when feature is enabled.
   * - Confirms that clicking VPC navigation item directs user to VPC landing page.
   */
  it('can navigate to VPC landing page', () => {
    mockAppendFeatureFlags({
      vpc: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('/linodes');
    cy.wait(['@getFeatureFlags', '@getClientStream']);

    ui.nav.findItemByTitle('VPC').should('be.visible').click();

    cy.url().should('endWith', '/vpc');
  });

  /*
   * - Confirms that VPC sidebar nav item is not shown when feature is disabled.
   */
  it('does not show VPC navigation item when feature is disabled', () => {
    // TODO Delete this test when VPC feature flag is removed from codebase.
    mockAppendFeatureFlags({
      vpc: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('/linodes');
    cy.wait(['@getFeatureFlags', '@getClientStream']);

    ui.nav.find().within(() => {
      cy.findByText('VPC').should('not.exist');
    });
  });
});
