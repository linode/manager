/**
 * @file Integration tests for Akamai Cloud Load Balancer navigation.
 */

import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { ui } from 'support/ui';

describe('Akamai Cloud Load Balancer navigation', () => {
  /*
   * - Confirms that ACLB sidebar nav item is present when feature is enabled.
   * - Confirms that clicking on ACLB nav item directs users to ACLB landing page.
   */
  it('can navigate to load balancer landing page', () => {
    // TODO Delete feature flag mocks when ACLB feature flag goes away.
    mockAppendFeatureFlags({
      aclb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('/linodes');
    cy.wait(['@getFeatureFlags', '@getClientStream']);

    ui.nav.findItemByTitle('Cloud Load Balancers').should('be.visible').click();

    cy.url().should('endWith', '/loadbalancers');
  });

  /*
   * - Confirms that ACLB sidebar nav item is not shown when feature is not enabled.
   */
  it('does not show load balancer navigation item when feature is disabled', () => {
    // TODO Delete this test when ACLB feature flag goes away.
    mockAppendFeatureFlags({
      aclb: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('/linodes');
    cy.wait(['@getFeatureFlags', '@getClientStream']);

    ui.nav.find().within(() => {
      cy.findByText('Cloud Load Balancers').should('not.exist');
    });
  });
});
