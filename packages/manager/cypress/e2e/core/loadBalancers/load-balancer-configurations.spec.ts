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
  mockCreateLoadBalancerConfiguration,
  mockCreateLoadBalancerConfigurationError,
  mockDeleteLoadBalancerConfiguration,
  mockDeleteLoadBalancerConfigurationError,
  mockGetLoadBalancer,
  mockGetLoadBalancerCertificates,
  mockGetLoadBalancerConfigurations,
  mockGetLoadBalancerRoutes,
} from 'support/intercepts/load-balancers';
import { ui } from 'support/ui';

describe('Akamai Global Load Balancer configurations page', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
  });

  it('renders configurations', () => {
    const loadbalancer = loadbalancerFactory.build();
    const configurations = configurationFactory.buildList(5);

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
  describe('create', () => {
    it('creates a HTTPS configuration', () => {
      const loadbalancer = loadbalancerFactory.build();
      const certificates = certificateFactory.buildList(1);
      const routes = routeFactory.buildList(1);
      const configuration = configurationFactory.build();

      mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
      mockGetLoadBalancerConfigurations(loadbalancer.id, []).as(
        'getConfigurations'
      );
      mockGetLoadBalancerCertificates(loadbalancer.id, certificates);
      mockGetLoadBalancerRoutes(loadbalancer.id, routes);
      mockCreateLoadBalancerConfiguration(loadbalancer.id, configuration).as(
        'createConfiguration'
      );

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
        .type(configuration.label);

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

        ui.buttonGroup
          .findButtonByTitle('Add Route')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

      ui.button
        .findByTitle('Create Configuration')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait(['@createConfiguration', '@getConfigurations']);
    });
    it('creates a HTTP configuration', () => {
      const loadbalancer = loadbalancerFactory.build();
      const routes = routeFactory.buildList(1, { protocol: 'http' });
      const configuration = configurationFactory.build({
        port: 80,
        protocol: 'http',
      });

      mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
      mockGetLoadBalancerConfigurations(loadbalancer.id, []).as(
        'getConfigurations'
      );
      mockGetLoadBalancerRoutes(loadbalancer.id, routes);
      mockCreateLoadBalancerConfiguration(loadbalancer.id, configuration).as(
        'createConfiguration'
      );

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
        .type(configuration.label);

      cy.findByLabelText('Protocol').click();

      ui.autocompletePopper
        .findByTitle(configuration.protocol.toUpperCase())
        .click();

      cy.findByLabelText('Port').clear().type(configuration.port);

      // Certificates do not apply to HTTP, so make sure there is not mention of them
      cy.findByText('Details')
        .closest('form')
        .findByText('Certificate')
        .should('not.exist');

      ui.button.findByTitle('Add Route').click();

      ui.drawer.findByTitle('Add Route').within(() => {
        cy.findByLabelText('Route').click();

        ui.autocompletePopper.findByTitle(routes[0].label).click();

        ui.buttonGroup
          .findButtonByTitle('Add Route')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

      ui.button
        .findByTitle('Create Configuration')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait(['@createConfiguration', '@getConfigurations']);
    });
    it('creates a TCP configuration', () => {
      const loadbalancer = loadbalancerFactory.build();
      const routes = routeFactory.buildList(1, { protocol: 'tcp' });
      const configuration = configurationFactory.build({
        port: 22,
        protocol: 'tcp',
      });

      mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
      mockGetLoadBalancerConfigurations(loadbalancer.id, []).as(
        'getConfigurations'
      );
      mockGetLoadBalancerRoutes(loadbalancer.id, routes);
      mockCreateLoadBalancerConfiguration(loadbalancer.id, configuration).as(
        'createConfiguration'
      );

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
        .type(configuration.label);

      cy.findByLabelText('Protocol').click();

      ui.autocompletePopper
        .findByTitle(configuration.protocol.toUpperCase())
        .click();

      cy.findByLabelText('Port').clear().type(configuration.port);

      // Certificates do not apply to HTTP, so make sure there is not mention of them
      cy.findByText('Details')
        .closest('form')
        .findByText('Certificate')
        .should('not.exist');

      ui.button.findByTitle('Add Route').click();

      ui.drawer.findByTitle('Add Route').within(() => {
        cy.findByLabelText('Route').click();

        ui.autocompletePopper.findByTitle(routes[0].label).click();

        ui.buttonGroup
          .findButtonByTitle('Add Route')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

      ui.button
        .findByTitle('Create Configuration')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait(['@createConfiguration', '@getConfigurations']);
    });
    it('shows API errors when creating an HTTPS configuration', () => {
      const loadbalancer = loadbalancerFactory.build();
      const certificates = certificateFactory.buildList(1);
      const routes = routeFactory.buildList(1);

      mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
      mockGetLoadBalancerConfigurations(loadbalancer.id, []).as(
        'getConfigurations'
      );
      mockGetLoadBalancerCertificates(loadbalancer.id, certificates);
      mockGetLoadBalancerRoutes(loadbalancer.id, routes);

      const errors = [
        { field: 'label', reason: 'Must be greater than 2 characters.' },
        { field: 'port', reason: 'Must be a number.' },
        { field: 'protocol', reason: "Can't use UDP." },
        { field: 'route_ids', reason: 'Your routes are messed up.' },
        {
          field: 'certificates',
          reason: 'Something about your certs is not correct.',
        },
      ];

      mockCreateLoadBalancerConfigurationError(loadbalancer.id, errors).as(
        'createConfiguration'
      );

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
        .type('test');

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

        ui.buttonGroup
          .findButtonByTitle('Add Route')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

      ui.button
        .findByTitle('Create Configuration')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait(['@createConfiguration']);

      for (const { reason } of errors) {
        cy.findByText(reason).should('be.visible');
      }
    });
  });
  describe('delete', () => {
    it('deletes a configuration', () => {
      const loadbalancer = loadbalancerFactory.build();
      const configurations = configurationFactory.buildList(1);

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

      const configuration = configurations[0];

      cy.findByText(configuration.label).as('accordionHeader');
      // Click the accordion header to open the accordion
      cy.get('@accordionHeader').click();
      // Get the Configuration's entire accordion area
      cy.get('@accordionHeader')
        .closest('[data-qa-panel]')
        .within(() => {
          // Click the Delete button to open the delete dialog
          ui.button.findByTitle('Delete').click();
        });

      mockDeleteLoadBalancerConfiguration(loadbalancer.id, configuration.id).as(
        'deleteConfiguration'
      );
      mockGetLoadBalancerConfigurations(loadbalancer.id, []).as(
        'getConfigurations'
      );

      ui.dialog
        .findByTitle(`Delete Configuration ${configuration.label}?`)
        .within(() => {
          cy.findByText(
            'Are you sure you want to delete this configuration?'
          ).should('be.visible');

          ui.button.findByTitle('Delete').click();
        });

      cy.wait(['@deleteConfiguration', '@getConfigurations']);

      cy.findByText(configuration.label).should('not.exist');
    });
    it('shows API errors when deleting a configuration', () => {
      const loadbalancer = loadbalancerFactory.build();
      const configurations = configurationFactory.buildList(1);

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

      const configuration = configurations[0];

      cy.findByText(configuration.label).as('accordionHeader');
      // Click the accordion header to open the accordion
      cy.get('@accordionHeader').click();
      // Get the Configuration's entire accordion area
      cy.get('@accordionHeader')
        .closest('[data-qa-panel]')
        .within(() => {
          // Click the Delete button to open the delete dialog
          ui.button.findByTitle('Delete').click();
        });

      mockDeleteLoadBalancerConfigurationError(
        loadbalancer.id,
        configuration.id,
        'Control Plane Error'
      ).as('deleteConfiguration');

      ui.dialog
        .findByTitle(`Delete Configuration ${configuration.label}?`)
        .within(() => {
          cy.findByText(
            'Are you sure you want to delete this configuration?'
          ).should('be.visible');

          ui.button.findByTitle('Delete').click();

          cy.wait(['@deleteConfiguration']);

          cy.findByText('Control Plane Error').should('be.visible');
        });
    });
  });
});
