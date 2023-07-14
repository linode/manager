/**
 * @file Integration tests for Akamai Global Load Balancer navigation.
 */

import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { ui } from 'support/ui';

describe('Akamai Global Load Balancer navigation', () => {
  /*
   * - Confirms that AGLB sidebar nav item is present when feature is enabled.
   * - Confirms that clicking on AGLB nav item directs users to AGLB landing page.
   */
  it('can navigate to load balancer landing page', () => {
    // TODO Delete feature flag mocks when AGLB feature flag goes away.
    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('/linodes');
    cy.wait(['@getFeatureFlags', '@getClientStream']);

    ui.nav
      .findItemByTitle('Global Load Balancers')
      .should('be.visible')
      .click();

    cy.url().should('endWith', '/loadbalancers');
  });

  /*
   * - Confirms that AGLB sidebar nav item is not shown when feature is not enabled.
   */
  it('does not show load balancer navigation item when feature is disabled', () => {
    // TODO Delete this test when AGLB feature flag goes away.
    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('/linodes');
    cy.wait(['@getFeatureFlags', '@getClientStream']);

    ui.nav.find().within(() => {
      cy.findByText('Global Load Balancers').should('not.exist');
    });
  });
});
