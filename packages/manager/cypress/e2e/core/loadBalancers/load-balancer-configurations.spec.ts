import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { loadbalancerFactory, configurationFactory } from '@src/factories';
import {
  mockGetLoadBalancer,
  mockGetLoadBalancerConfigurations,
} from 'support/intercepts/load-balancers';

describe('Akamai Global Load Balancer configurations page', () => {
  it('renders configurations', () => {
    const loadbalancer = loadbalancerFactory.build();
    const configurations = configurationFactory.buildList(5);

    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
    mockGetLoadBalancerConfigurations(loadbalancer.id, configurations).as(
      'getConfigurations'
    );

    cy.visitWithLogin(`/loadbalancers/${loadbalancer.id}/configurations`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getLoadBalancer',
      '@getConfigurations',
    ]);

    for (const configuration of configurations) {
      cy.findByText(configuration.label).should('be.visible');
    }
  });
});
