/**
 * @file Integration tests for VPC navigation.
 */

import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { ui } from 'support/ui';
import { mockGetUserPreferences } from 'support/intercepts/profile';

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

    // Ensure that the Primary Nav is open
    mockGetUserPreferences({ desktop_sidebar_open: false }).as(
      'getPreferences'
    );

    cy.visitWithLogin('/linodes');
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getPreferences']);

    ui.nav.findItemByTitle('VPC').should('be.visible').click();

    cy.url().should('endWith', '/vpcs');
  });
});
