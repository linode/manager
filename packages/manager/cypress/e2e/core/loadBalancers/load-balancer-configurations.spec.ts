import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import {
  loadbalancerFactory,
  configurationFactory,
  certificateFactory,
  routeFactory,
} from '@src/factories';
import {
  mockGetLoadBalancer,
  mockGetLoadBalancerCertificates,
  mockGetLoadBalancerConfigurations,
  mockGetLoadBalancerRoutes,
} from 'support/intercepts/load-balancers';
import { ui } from 'support/ui';

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
  it('should create a HTTPS configuration', () => {
    const loadbalancer = loadbalancerFactory.build();
    const certificates = certificateFactory.buildList(1);
    const routes = routeFactory.buildList(1);

    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
    mockGetLoadBalancerConfigurations(loadbalancer.id, []).as(
      'getConfigurations'
    );
    mockGetLoadBalancerCertificates(loadbalancer.id, certificates);
    mockGetLoadBalancerRoutes(loadbalancer.id, routes);

    cy.visitWithLogin(`/loadbalancers/${loadbalancer.id}/configurations`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getLoadBalancer',
      '@getConfigurations',
    ]);

    ui.button.findByTitle('Add Configuration').click();

    cy.findByLabelText('Configuration Label')
      .should('be.visible')
      .type('config-0');

    ui.button.findByTitle('Apply Certificates').should('be.visible').click();

    ui.drawer.findByTitle('Apply Certificates').within(() => {
      cy.findByLabelText('Host Header').should('be.visible').type('*');

      cy.findByLabelText('Certificate').should('be.visible').click();

      ui.autocompletePopper
        .findByTitle(certificates[0].label)
        .should('be.visible')
        .click();

      ui.button
        .findByTitle('Save')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.findByText(certificates[0].label);
    cy.findByText('*');

    ui.button.findByTitle('Add Route').click();

    ui.drawer.findByTitle('Add Route').within(() => {
      cy.findByLabelText('Route').click();

      ui.autocompletePopper.findByTitle(routes[0].label).click();

      cy.get("[type='submit']")
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    ui.button
      .findByTitle('Create Configuration')
      .should('be.visible')
      .should('be.enabled')
      .click();
  });
});
