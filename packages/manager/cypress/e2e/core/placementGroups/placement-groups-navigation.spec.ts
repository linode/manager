/**
 * @file Integration tests for Placement Groups navigation.
 */

import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { mockGetAccount } from 'support/intercepts/account';
import { accountFactory } from 'src/factories';
import { ui } from 'support/ui';

import type { Flags } from 'src/featureFlags';

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
    mockAppendFeatureFlags({
      placementGroups: makeFeatureFlagData<Flags['placementGroups']>({
        beta: true,
        enabled: true,
      }),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('/linodes');
    cy.wait(['@getFeatureFlags', '@getClientStream']);

    ui.nav.findItemByTitle('Placement Groups').should('be.visible').click();

    cy.url().should('endWith', '/placement-groups');
  });

  /*
   * - Confirms that Placement Groups navigation item is not shown when feature flag is disabled.
   */
  it('does not show Placement Groups navigation item when feature is disabled', () => {
    mockAppendFeatureFlags({
      placementGroups: makeFeatureFlagData<Flags['placementGroups']>({
        beta: true,
        enabled: false,
      }),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('/linodes');
    cy.wait(['@getFeatureFlags', '@getClientStream']);

    ui.nav.find().within(() => {
      cy.findByText('Placement Groups').should('not.exist');
    });
  });

  /*
   * - Confirms that manual navigation to Placement Groups landing page with feature is disabled displays Not Found to user.
   */
  it('displays Not Found when manually navigating to /placement-groups with feature flag disabled', () => {
    mockAppendFeatureFlags({
      placementGroups: makeFeatureFlagData<Flags['placementGroups']>({
        beta: true,
        enabled: false,
      }),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('/placement-groups');
    cy.wait(['@getFeatureFlags', '@getClientStream']);

    cy.findByText('Not Found').should('be.visible');
  });
});
