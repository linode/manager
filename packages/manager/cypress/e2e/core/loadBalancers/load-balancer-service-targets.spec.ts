/**
 * @file Integration tests for Akamai Global Load Balancer service targets.
 */

import type { ServiceTarget } from '@linode/api-v4';
import { serviceTargetFactory } from '@src/factories';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import {
  mockGetServiceTargets,
  mockGetServiceTargetsError,
} from 'support/intercepts/load-balancers';
import { ui } from 'support/ui';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { randomLabel } from 'support/util/random';

// @todo this page won't exist anymore. It will be moved to /loadbalancer/:id/service-targets
describe.skip('Akamai Global Load Balancer service targets', () => {
  /*
   * - Confirms user can navigate to AGLB service target landing page when feature is enabled.
   * - Confirms that service targets are listed on the landing page.
   * - Confirms graceful error handling upon API 500 response.
   */
  it('can navigate to service targets landing page', () => {
    const mockServiceTargets = [
      serviceTargetFactory.build({
        label: randomLabel(),
      }),
      serviceTargetFactory.build({
        label: randomLabel(),
      }),
      serviceTargetFactory.build({
        label: randomLabel(),
      }),
    ];

    // Message to show upon HTTP 500 response to get service targets.
    const mockErrorMessage = 'An unknown error occurred.';

    // TODO Remove feature flag mocks once feature flag has been removed.
    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetServiceTargets(mockServiceTargets).as('getServiceTargets');

    cy.visitWithLogin('/loadbalancers/service-targets');
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getServiceTargets']);

    cy.findByText('Akamai Global Load Balancers').should('be.visible');
    ui.button
      .findByTitle('Create Service Target')
      .should('be.visible')
      .should('be.enabled');

    mockServiceTargets.forEach((mockServiceTarget: ServiceTarget) => {
      cy.findByText(mockServiceTarget.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          // TODO Assert for other balancing policies once available.
          cy.findByText('round robin').should('be.visible');
          // TODO Assert action menu behavior and items once available.
          // TODO Assert health checks are shown once available.
        });
    });

    // Confirm graceful error handling by reloading and mocking GET failure.
    mockGetServiceTargetsError(mockErrorMessage).as('getServiceTargets');
    cy.visitWithLogin('/loadbalancers/service-targets');
    cy.wait('@getServiceTargets');
    cy.findByText(mockErrorMessage).should('be.visible');
  });

  /*
   * - Confirms 'Not Found' message upon navigating to service targets when feature is disabled.
   */
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
