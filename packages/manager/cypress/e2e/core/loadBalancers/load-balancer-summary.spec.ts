/**
 * @file Integration tests for Akamai Global Load Balancer summary page.
 */

import { loadbalancerFactory, configurationFactory } from '@src/factories/aglb';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';

import {
  mockGetLoadBalancer,
  mockGetLoadBalancers,
  mockDeleteLoadBalancer,
} from 'support/intercepts/load-balancers';
import { randomLabel } from 'support/util/random';
import { ui } from 'support/ui';
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

describe('Delete', () => {
  /*
   * Deleting a load balancer from the AGLB load balancer details page "Settings" tab (route: /loadbalancers/:id/settings)
   * Confirms User is redirected to AGLB landing page upon deleting from Load Balancer details page "Settings" tab, and load balancer is not listed on the landing page.
   */

  // Test case for deleting a load balancer from the Settings tab.
  it('Deletes a loadbalancer from Settings tab', () => {
    const mockLoadBalancer = loadbalancerFactory.build();

    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');

    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancer(mockLoadBalancer).as('getLoadBalancer');

    // Visit the specific load balancer's page with login.
    cy.visitWithLogin(`/loadbalancers/${mockLoadBalancer.id}`);

    // Wait for all the mock API calls to complete.
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getLoadBalancer']);

    // Navigate to the 'Settings' tab.
    cy.findByText('Settings').should('be.visible').click();

    cy.findByText(mockLoadBalancer.label).should('be.visible');

    cy.findByText('Delete Load Balancer').should('be.visible');

    // Mock the API call for deleting the load balancer.
    mockDeleteLoadBalancer(mockLoadBalancer.id).as('deleteLoadBalancer');

    // Setup additional mock load balancer data.
    const loadBalancerConfiguration = configurationFactory.build();
    const loadbalancerMocks = [
      loadbalancerFactory.build({
        id: 1,
        label: randomLabel(),
        configurations: [
          {
            id: loadBalancerConfiguration.id,
            label: loadBalancerConfiguration.label,
          },
        ],
        regions: ['us-east'],
      }),
    ];
    const loadbalancerMock = loadbalancerMocks[0];

    mockGetLoadBalancers(loadbalancerMocks).as('getLoadBalancers');

    ui.button.findByTitle('Delete').should('be.visible').click();

    // Handle the delete confirmation dialog.
    ui.dialog
      .findByTitle(`Delete ${mockLoadBalancer.label}?`)
      .should('be.visible')
      .within(() => {
        cy.findByTestId('textfield-input')
          .should('be.visible')
          .click()
          .type(mockLoadBalancer.label);

        ui.buttonGroup
          .findButtonByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Wait for the delete operation and subsequent data retrieval to complete.
    cy.wait(['@deleteLoadBalancer', '@getLoadBalancers']);

    // Confirm user is navigated to the load balancers landing page list.
    cy.findByText(loadbalancerMock.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.actionMenu
          .findByTitle(
            `Action menu for Load Balancer ${loadbalancerMock.label}`
          )
          .should('be.visible');
      });

    // Verify that the deleted load balancer no longer exists in the list.
    cy.findByText(mockLoadBalancer.label).should('not.exist');
  });
});
