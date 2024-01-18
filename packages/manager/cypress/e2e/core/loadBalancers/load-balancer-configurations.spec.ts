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
  mockUpdateLoadBalancerConfiguration,
  mockUpdateLoadBalancerConfigurationError,
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

      ui.button.findByTitle('Add Certificate').should('be.visible').click();

      ui.drawer.findByTitle('Add Certificate').within(() => {
        cy.findByLabelText('Add Existing Certificate').click();

        cy.findByLabelText('Host Header').should('be.visible').type('*');

        cy.findByLabelText('Certificate').should('be.visible').click();

        ui.autocompletePopper
          .findByTitle(certificates[0].label)
          .should('be.visible')
          .click();

        ui.button
          .findByTitle('Add')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

      cy.findByText(certificates[0].label);
      cy.findByText('*');

      ui.button.findByTitle('Add Route').click();

      ui.drawer.findByTitle('Add Route').within(() => {
        cy.findByLabelText('Route').click();

        ui.autocompletePopper
          .findByTitle(routes[0].label, { exact: false })
          .click();

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

        ui.autocompletePopper
          .findByTitle(routes[0].label, { exact: false })
          .click();

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

        ui.autocompletePopper
          .findByTitle(routes[0].label, { exact: false })
          .click();

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

      ui.button.findByTitle('Add Certificate').should('be.visible').click();

      ui.drawer.findByTitle('Add Certificate').within(() => {
        cy.findByLabelText('Add Existing Certificate').click();

        cy.findByLabelText('Host Header').should('be.visible').type('*');

        cy.findByLabelText('Certificate').should('be.visible').click();

        ui.autocompletePopper
          .findByTitle(certificates[0].label)
          .should('be.visible')
          .click();

        ui.button
          .findByTitle('Add')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

      cy.findByText(certificates[0].label);
      cy.findByText('*');

      ui.button.findByTitle('Add Route').click();

      ui.drawer.findByTitle('Add Route').within(() => {
        cy.findByLabelText('Route').click();

        ui.autocompletePopper
          .findByTitle(routes[0].label, { exact: false })
          .click();

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

  describe('update', () => {
    it('edits a HTTPS configuration', () => {
      const configuration = configurationFactory.build({ protocol: 'https' });
      const loadbalancer = loadbalancerFactory.build({
        configurations: [{ id: configuration.id, label: configuration.label }],
      });
      const certificates = certificateFactory.buildList(3);
      const routes = routeFactory.buildList(3);

      mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
      mockGetLoadBalancerConfigurations(loadbalancer.id, [configuration]).as(
        'getConfigurations'
      );
      mockGetLoadBalancerCertificates(loadbalancer.id, certificates).as(
        'getCertificates'
      );
      mockUpdateLoadBalancerConfiguration(loadbalancer.id, configuration).as(
        'updateConfiguration'
      );
      mockGetLoadBalancerRoutes(loadbalancer.id, routes).as('getRoutes');

      cy.visitWithLogin(
        `/loadbalancers/${loadbalancer.id}/configurations/${configuration.id}`
      );

      cy.wait([
        '@getFeatureFlags',
        '@getClientStream',
        '@getLoadBalancer',
        '@getConfigurations',
        '@getRoutes',
        '@getCertificates',
      ]);

      // In edit mode, we will disable the "save" button if the user hasn't made any changes
      ui.button
        .findByTitle('Save Configuration')
        .should('be.visible')
        .should('be.disabled');

      cy.findByLabelText('Configuration Label')
        .should('be.visible')
        .clear()
        .type('new-label');

      cy.findByLabelText('Port').should('be.visible').clear().type('444');

      ui.button
        .findByTitle('Add Certificate')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer.findByTitle('Add Certificate').within(() => {
        cy.findByLabelText('Add Existing Certificate').click();

        cy.findByLabelText('Host Header').type('example-1.com');

        cy.findByLabelText('Certificate').click();

        ui.autocompletePopper.findByTitle(certificates[1].label).click();

        ui.button
          .findByTitle('Add')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

      ui.button
        .findByTitle('Save Configuration')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@updateConfiguration');
    });

    it('can remove a route from an AGLB configuration', () => {
      const routes = routeFactory.buildList(3);
      const configuration = configurationFactory.build({
        protocol: 'http',
        routes: routes.map((route) => ({ id: route.id, label: route.label })),
      });
      const loadbalancer = loadbalancerFactory.build({
        configurations: [{ id: configuration.id, label: configuration.label }],
      });

      mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
      mockGetLoadBalancerConfigurations(loadbalancer.id, [configuration]).as(
        'getConfigurations'
      );
      mockUpdateLoadBalancerConfiguration(loadbalancer.id, configuration).as(
        'updateConfiguration'
      );
      mockGetLoadBalancerRoutes(loadbalancer.id, routes).as('getRoutes');

      cy.visitWithLogin(
        `/loadbalancers/${loadbalancer.id}/configurations/${configuration.id}`
      );

      cy.wait([
        '@getFeatureFlags',
        '@getClientStream',
        '@getLoadBalancer',
        '@getConfigurations',
        '@getRoutes',
      ]);

      // In edit mode, we will disable the "save" button if the user hasn't made any changes
      ui.button
        .findByTitle('Save Configuration')
        .should('be.visible')
        .should('be.disabled');

      const routeToDelete = routes[1];

      cy.findByText(routeToDelete.label)
        .closest('tr')
        .within(() => {
          ui.actionMenu
            .findByTitle(`Action Menu for Route ${routeToDelete.label}`)
            .click();
        });

      // Because the route table uses an API filter at all times to show the correct routes,
      // we must simulate the filtering by mocking.
      const newRoutes = routes.filter((r) => r.label !== routeToDelete.label);
      mockGetLoadBalancerRoutes(loadbalancer.id, newRoutes).as('getRoutes');

      ui.actionMenuItem.findByTitle('Remove').click();

      const newConfiguration = {
        ...configuration,
        routes: newRoutes.map((r) => ({ id: r.id, label: r.label })),
      };

      // Beacsue the configruations data will be invalidated and refetched,
      // we must mock that the route was removed.
      mockGetLoadBalancerConfigurations(loadbalancer.id, [newConfiguration]).as(
        'getConfigurations'
      );

      ui.button
        .findByTitle('Save Configuration')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@updateConfiguration');

      // After successfully saving changes, the button should be disabled.
      ui.button
        .findByTitle('Save Configuration')
        .should('be.visible')
        .should('be.disabled');
    });

    it('shows API errors when editing', () => {
      const configuration = configurationFactory.build({ protocol: 'https' });
      const loadbalancer = loadbalancerFactory.build({
        configurations: [{ id: configuration.id, label: configuration.label }],
      });

      mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
      mockGetLoadBalancerConfigurations(loadbalancer.id, [configuration]).as(
        'getConfigurations'
      );

      const errors = [
        { field: 'label', reason: 'Bad Label.' },
        { field: 'port', reason: 'Port number is too high.' },
        { field: 'protocol', reason: 'This protocol is not supported.' },
        {
          field: 'certificates[0].id',
          reason: 'Certificate 0 does not exist.',
        },
        {
          field: 'certificates[0].hostname',
          reason: 'That hostname is too long.',
        },
        { field: 'route_ids', reason: 'Some of these routes do not exist.' },
      ];

      mockUpdateLoadBalancerConfigurationError(
        loadbalancer.id,
        configuration.id,
        errors
      ).as('updateConfigurationError');

      cy.visitWithLogin(
        `/loadbalancers/${loadbalancer.id}/configurations/${configuration.id}`
      );

      cy.wait([
        '@getFeatureFlags',
        '@getClientStream',
        '@getLoadBalancer',
        '@getConfigurations',
      ]);

      // In edit mode, we will disable the "save" button if the user hasn't made any changes
      ui.button
        .findByTitle('Save Configuration')
        .should('be.visible')
        .should('be.disabled');

      cy.findByLabelText('Configuration Label')
        .should('be.visible')
        .clear()
        .type('new-label');

      ui.button
        .findByTitle('Save Configuration')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@updateConfigurationError');

      for (const error of errors) {
        cy.findByText(error.reason).should('be.visible');
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
