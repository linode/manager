/**
 * @file Integration tests for Akamai Global Load Balancer routes page.
 */

import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import {
  loadbalancerFactory,
  routeFactory,
  serviceTargetFactory,
} from '@src/factories';
import { ui } from 'support/ui';
import {
  mockGetLoadBalancer,
  mockGetLoadBalancerRoutes,
  mockGetLoadBalancerServiceTargets,
  mockUpdateRoute,
  mockUpdateRouteError,
} from 'support/intercepts/load-balancers';

describe('Akamai Global Load Balancer routes page', () => {
  it('can edit a route label and protocol', () => {
    const indexOfRuleToEdit = 1;
    const loadbalancer = loadbalancerFactory.build();
    const routes = routeFactory.buildList(indexOfRuleToEdit, {
      protocol: 'http',
    });

    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
    mockGetLoadBalancerRoutes(loadbalancer.id, routes).as('getRoutes');

    cy.visitWithLogin(`/loadbalancers/${loadbalancer.id}/routes`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getLoadBalancer',
      '@getRoutes',
    ]);

    ui.actionMenu
      .findByTitle(`Action Menu for Route ${routes[0].label}`)
      .click();

    ui.actionMenuItem.findByTitle('Edit').click();

    mockUpdateRoute(loadbalancer, routes[0]).as('updateRoute');

    ui.drawer
      .findByTitle(`Edit Route ${routes[0].label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Route Label').should(
          'have.value',
          `${routes[0].label}`
        );
        // .clear() // TODO: [M3-7028] - Enable when we have real data and not mocks
        // .type('new-label'); // TODO: [M3-7028] - Enable when we have real data and not mocks

        cy.get('[data-qa-radio="HTTP"]').find('input').should('be.checked');
        cy.get('[data-qa-radio="TCP"]').click();

        ui.buttonGroup
          .findButtonByTitle('Edit Route')
          .should('be.visible')
          .should('be.enabled');
        // .click(); // TODO: [M3-7028] - Enable when we have real data and not mocks
      });

    // TODO: [M3-7028] - Enable when we have real data and not mocks
    // cy.wait('@updateRoute');
    // cy.findByLabelText('Route 0').within(() => {
    //   cy.findByText('new-label');
    //   cy.findByText('TCP');
    // });
  });
  it('can add a HTTP rule', () => {
    const loadbalancer = loadbalancerFactory.build();
    const routes = routeFactory.buildList(1, { protocol: 'http' });
    const serviceTargets = serviceTargetFactory.buildList(3);

    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
    mockGetLoadBalancerRoutes(loadbalancer.id, routes).as('getRoutes');
    mockGetLoadBalancerServiceTargets(loadbalancer.id, serviceTargets).as(
      'getServiceTargets'
    );

    cy.visitWithLogin(`/loadbalancers/${loadbalancer.id}/routes`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getLoadBalancer',
      '@getRoutes',
    ]);

    ui.button
      .findByTitle('Add Rule')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockUpdateRoute(loadbalancer, routes[0]).as('updateRoute');

    ui.drawer
      .findByTitle('Add Rule')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Match Type')
          .should('be.visible')
          .click()
          .type('Header');

        ui.autocompletePopper
          .findByTitle('HTTP Header')
          .should('be.visible')
          .click();

        cy.findByLabelText('Match Value')
          .should('be.visible')
          .type('x-header=value');

        cy.findByLabelText('Percent')
          .should('be.visible')
          .click()
          .clear()
          .type('50');

        cy.findByLabelText('Service Target')
          .should('be.visible')
          .click()
          .type(serviceTargets[0].label);

        cy.wait('@getServiceTargets');

        ui.autocompletePopper
          .findByTitle(serviceTargets[0].label)
          .should('be.visible')
          .click();

        cy.findByText('Add Service Target').click();

        cy.findByDisplayValue('100')
          .should('be.visible')
          .click()
          .clear()
          .type('50');

        cy.findAllByLabelText('Service Target')
          .last()
          .should('be.visible')
          .click()
          .type(serviceTargets[1].label);

        cy.wait('@getServiceTargets');

        ui.autocompletePopper
          .findByTitle(serviceTargets[1].label)
          .should('be.visible')
          .click();

        cy.findByLabelText('Use Session Stickiness').check();

        cy.findByLabelText('Cookie type').should('be.visible').click();

        ui.autocompletePopper
          .findByTitle('Origin')
          .should('be.visible')
          .click();

        cy.findAllByLabelText('Cookie')
          .should('be.visible')
          .click()
          .clear()
          .type('my-cookie-for-sticky');

        ui.buttonGroup
          .findButtonByTitle('Add Rule')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@updateRoute');
  });
  it('can add a TCP rule', () => {
    const loadbalancer = loadbalancerFactory.build();
    const routes = routeFactory.buildList(1, { protocol: 'tcp' });
    const serviceTargets = serviceTargetFactory.buildList(3);

    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
    mockGetLoadBalancerRoutes(loadbalancer.id, routes).as('getRoutes');
    mockGetLoadBalancerServiceTargets(loadbalancer.id, serviceTargets).as(
      'getServiceTargets'
    );

    cy.visitWithLogin(`/loadbalancers/${loadbalancer.id}/routes`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getLoadBalancer',
      '@getRoutes',
    ]);

    ui.button
      .findByTitle('Add Rule')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockUpdateRoute(loadbalancer, routes[0]).as('updateRoute');

    ui.drawer
      .findByTitle('Add Rule')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Percent')
          .should('be.visible')
          .click()
          .clear()
          .type('50');

        cy.findByLabelText('Service Target')
          .should('be.visible')
          .click()
          .type(serviceTargets[0].label);

        cy.wait('@getServiceTargets');

        ui.autocompletePopper
          .findByTitle(serviceTargets[0].label)
          .should('be.visible')
          .click();

        cy.findByText('Add Service Target').click();

        cy.findByDisplayValue('100')
          .should('be.visible')
          .click()
          .clear()
          .type('50');

        cy.findAllByLabelText('Service Target')
          .last()
          .should('be.visible')
          .click()
          .type(serviceTargets[1].label);

        cy.wait('@getServiceTargets');

        ui.autocompletePopper
          .findByTitle(serviceTargets[1].label)
          .should('be.visible')
          .click();

        ui.buttonGroup
          .findButtonByTitle('Add Rule')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@updateRoute');
  });
  it('can edit a HTTP rule', () => {
    const loadbalancer = loadbalancerFactory.build();
    const routes = routeFactory.buildList(1, { protocol: 'http' });
    const serviceTargets = serviceTargetFactory.buildList(3);

    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
    mockGetLoadBalancerRoutes(loadbalancer.id, routes).as('getRoutes');
    mockGetLoadBalancerServiceTargets(loadbalancer.id, serviceTargets).as(
      'getServiceTargets'
    );

    cy.visitWithLogin(`/loadbalancers/${loadbalancer.id}/routes`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getLoadBalancer',
      '@getRoutes',
    ]);

    cy.findByLabelText(`route-${routes[0].id} expand row`).click();

    ui.actionMenu.findByTitle('Action Menu for Rule 0').click();

    ui.actionMenuItem.findByTitle('Edit').click();

    mockUpdateRoute(loadbalancer, routes[0]).as('updateRoute');

    ui.drawer
      .findByTitle('Edit Rule')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Hostname')
          .should('have.value', routes[0].rules[0].match_condition.hostname)
          .clear()
          .type('example.com');

        cy.findByLabelText('Match Type')
          .should('be.visible')
          .click()
          .clear()
          .type('Header');

        ui.autocompletePopper
          .findByTitle('HTTP Header')
          .should('be.visible')
          .click();

        cy.findByLabelText('Match Value')
          .should('have.value', routes[0].rules[0].match_condition.match_value)
          .clear()
          .type('x-header=my-header-value');

        ui.buttonGroup
          .findButtonByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@updateRoute');

    // Verify the table updates after the drawer saves and closes
    cy.findByLabelText('Rule 0').within(() => {
      cy.findByText('x-header=my-header-value');
      cy.findByText('HTTP Header');
    });
  });
  it('surfaces API errors in the Add Rule Drawer for an HTTP route', () => {
    const loadbalancer = loadbalancerFactory.build();
    const routes = routeFactory.buildList(1, { protocol: 'http' });
    const serviceTargets = serviceTargetFactory.buildList(3);

    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
    mockGetLoadBalancerRoutes(loadbalancer.id, routes).as('getRoutes');
    mockGetLoadBalancerServiceTargets(loadbalancer.id, serviceTargets).as(
      'getServiceTargets'
    );

    cy.visitWithLogin(`/loadbalancers/${loadbalancer.id}/routes`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getLoadBalancer',
      '@getRoutes',
    ]);

    ui.button
      .findByTitle('Add Rule')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockUpdateRouteError(loadbalancer, routes[0]).as('updateRoute');

    ui.drawer
      .findByTitle('Add Rule')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Match Value')
          .should('be.visible')
          .type('x-header=value');

        cy.findByLabelText('Service Target')
          .should('be.visible')
          .click()
          .type(serviceTargets[0].label);

        cy.wait('@getServiceTargets');

        ui.autocompletePopper
          .findByTitle(serviceTargets[0].label)
          .should('be.visible')
          .click();

        ui.buttonGroup
          .findButtonByTitle('Add Rule')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@updateRoute');

    cy.findByText('Bad Match Value');
    cy.findByText('Bad Match Type');
    cy.findByText('Service Target does not exist');
    cy.findByText('Invalid percentage');
    cy.findByText('Invalid TTL', { exact: false });
    cy.findByText('Invalid Cookie', { exact: false });
    cy.findByText('A backend service is down', { exact: false });
    cy.findByText('You reached a rate limit', { exact: false });
    cy.findByText('Hostname is not valid');

    cy.findByLabelText('Use Session Stickiness').check();

    cy.findByText('Invalid TTL', { exact: true });
    cy.findByText('Invalid Cookie', { exact: true });
  });
  it('surfaces API errors in the Add Rule Drawer for a TCP route', () => {
    const loadbalancer = loadbalancerFactory.build();
    const routes = routeFactory.buildList(1, { protocol: 'tcp' });
    const serviceTargets = serviceTargetFactory.buildList(3);

    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
    mockGetLoadBalancerRoutes(loadbalancer.id, routes).as('getRoutes');
    mockGetLoadBalancerServiceTargets(loadbalancer.id, serviceTargets).as(
      'getServiceTargets'
    );

    cy.visitWithLogin(`/loadbalancers/${loadbalancer.id}/routes`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getLoadBalancer',
      '@getRoutes',
    ]);

    ui.button
      .findByTitle('Add Rule')
      .should('be.visible')
      .should('be.enabled')
      .click();

    mockUpdateRouteError(loadbalancer, routes[0]).as('updateRoute');

    ui.drawer
      .findByTitle('Add Rule')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Service Target')
          .should('be.visible')
          .click()
          .type(serviceTargets[0].label);

        cy.wait('@getServiceTargets');

        ui.autocompletePopper
          .findByTitle(serviceTargets[0].label)
          .should('be.visible')
          .click();

        ui.buttonGroup
          .findButtonByTitle('Add Rule')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@updateRoute');

    cy.findByText('Bad Match Value', { exact: false });
    cy.findByText('Bad Match Type', { exact: false });
    cy.findByText('Service Target does not exist');
    cy.findByText('Invalid percentage');
    cy.findByText('Invalid TTL', { exact: false });
    cy.findByText('Invalid Cookie', { exact: false });
    cy.findByText('A backend service is down', { exact: false });
    cy.findByText('You reached a rate limit', { exact: false });
  });
  it('can delete a rule', () => {
    const loadbalancer = loadbalancerFactory.build();
    const routes = routeFactory.buildList(1, { protocol: 'http' });

    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
    mockGetLoadBalancerRoutes(loadbalancer.id, routes).as('getRoutes');

    cy.visitWithLogin(`/loadbalancers/${loadbalancer.id}/routes`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getLoadBalancer',
      '@getRoutes',
    ]);

    // Expand the route table
    cy.findByLabelText(`route-${routes[0].id} expand row`).click();

    // Verify all rules are shown
    for (const rule of routes[0].rules) {
      cy.findByText(rule.match_condition.match_value).should('be.visible');
    }

    const indexOfRuleToDelete = 1;

    ui.actionMenu
      .findByTitle(`Action Menu for Rule ${indexOfRuleToDelete}`)
      .click();

    ui.actionMenuItem.findByTitle('Delete').click();

    mockUpdateRoute(loadbalancer, routes[0]).as('updateRoute');

    ui.dialog.findByTitle('Delete Rule?').within(() => {
      ui.button.findByTitle('Delete').should('be.visible').click();
    });

    cy.wait('@updateRoute');

    // Verify the deleted rule no longer shows
    cy.findByText(
      routes[0].rules[indexOfRuleToDelete].match_condition.match_value
    ).should('not.exist');
  });
});

it('can create a Route', () => {
  const loadbalancer = loadbalancerFactory.build();
  const routes = routeFactory.buildList(1, { protocol: 'http' });

  mockAppendFeatureFlags({
    aglb: makeFeatureFlagData(true),
  }).as('getFeatureFlags');
  mockGetFeatureFlagClientstream().as('getClientStream');
  mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
  mockGetLoadBalancerRoutes(loadbalancer.id, routes).as('getRoutes');

  cy.visitWithLogin(`/loadbalancers/${loadbalancer.id}/routes`);
  cy.wait([
    '@getFeatureFlags',
    '@getClientStream',
    '@getLoadBalancer',
    '@getRoutes',
  ]);

  ui.button
    .findByTitle('Create Route')
    .should('be.visible')
    .should('be.enabled')
    .click();

  mockUpdateRoute(loadbalancer, routes[0]).as('updateRoute');

  ui.drawer
    .findByTitle('Create Route')
    .should('be.visible')
    .within(() => {
      cy.findByLabelText('Route Label')
        .should('be.visible')
        .click()
        .type(routes[0].label);

      cy.get('[data-qa-radio="HTTP"]').find('input').should('be.checked');

      ui.buttonGroup
        .findButtonByTitle('Create Route')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });
});

it('surfaces API errors in the Create Route Drawer', () => {
  const loadbalancer = loadbalancerFactory.build();
  const routes = routeFactory.buildList(1, { protocol: 'http' });

  mockAppendFeatureFlags({
    aglb: makeFeatureFlagData(true),
  }).as('getFeatureFlags');
  mockGetFeatureFlagClientstream().as('getClientStream');
  mockGetLoadBalancer(loadbalancer).as('getLoadBalancer');
  mockGetLoadBalancerRoutes(loadbalancer.id, routes).as('getRoutes');

  cy.visitWithLogin(`/loadbalancers/${loadbalancer.id}/routes`);
  cy.wait([
    '@getFeatureFlags',
    '@getClientStream',
    '@getLoadBalancer',
    '@getRoutes',
  ]);

  ui.button
    .findByTitle('Create Route')
    .should('be.visible')
    .should('be.enabled')
    .click();

  mockUpdateRoute(loadbalancer, routes[0]).as('updateRoute');

  ui.drawer
    .findByTitle('Create Route')
    .should('be.visible')
    .within(() => {
      ui.buttonGroup
        .findButtonByTitle('Create Route')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

  cy.findByText('Label is required.', { exact: false });
});
