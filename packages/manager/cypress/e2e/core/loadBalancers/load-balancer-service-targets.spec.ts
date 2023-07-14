/**
 * @file Integration tests for Akamai Global Load Balancer service targets.
 */

import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { mockGetServiceTargets } from 'support/intercepts/load-balancers';
import { ui } from 'support/ui';

describe('Akamai Global Load Balancer service targets', () => {
  it('can navigate to service targets landing page', () => {
    // TODO Remove feature flag mocks once feature flag has been removed.
    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetServiceTargets([]).as('getServiceTargets');

    cy.visitWithLogin('/loadbalancers/service-targets');
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getServiceTargets']);

    cy.findByText('Akamai Global Load Balancers').should('be.visible');
    ui.button
      .findByTitle('Create Service Target')
      .should('be.visible')
      .should('be.enabled');
  });

  it('cannot access service targets landing page when feature is disabled', () => {
    // TODO Remove this test once feature flag has been removed.
    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('/loadbalancers/service-targets');
    cy.wait(['@getFeatureFlags', '@getClientStream']);

    cy.findByText('Not Found').should('be.visible');
  });
});
