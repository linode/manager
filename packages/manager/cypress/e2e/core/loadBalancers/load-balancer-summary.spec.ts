/**
 * @file Integration tests for Akamai Global Load Balancer summary page.
 */

import { loadbalancerFactory } from '@src/factories/aglb';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { mockGetLoadBalancer } from 'support/intercepts/load-balancers';
import { makeFeatureFlagData } from 'support/util/feature-flags';

describe('Akamai Global Load Balancer details page', () => {
  it('renders all tabs and basic loadbalancer info', () => {
    const mockLoadBalancer = loadbalancerFactory.build();

    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');

    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancer(mockLoadBalancer).as('getLoadBalancer');

    cy.visitWithLogin(`/loadbalancers/${mockLoadBalancer.id}`);
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getLoadBalancer']);

    const tabs = [
      'Summary',
      'Configurations',
      'Routes',
      'Service Targets',
      'Certificates',
      'Settings',
    ];

    for (const tab of tabs) {
      cy.findByText(tab).should('be.visible');
    }

    cy.findByText(mockLoadBalancer.label).should('be.visible');
    cy.findByText(mockLoadBalancer.hostname).should('be.visible');
  });
});
