/**
 * @file Integration tests for Akamai Global Load Balancer navigation.
 */

import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { loadbalancerFactory, configurationFactory } from '@src/factories';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import {
  mockGetLoadBalancer,
  mockGetLoadBalancers,
  mockDeleteLoadBalancerError,
  mockDeleteLoadBalancer,
} from 'support/intercepts/load-balancers';
import type { Loadbalancer } from '@linode/api-v4';
import { chooseRegion } from 'support/util/regions';

/**
 * Navigates to the AGLB landing page using breadcrumb navigation.
 *
 * Asserts that the URL has updated to reflect navigation.
 */
const returnToLandingPage = () => {
  ui.entityHeader.find().within(() => {
    cy.findByText('Global Load Balancers').should('be.visible').click();
  });

  cy.url().should('endWith', '/loadbalancers');
};

describe('Akamai Global Load Balancer landing page', () => {
  /*
   * - Confirms that load balancers are listed on the AGLB landing page.
   * - Confirms that clicking a load balancer label directs to its details pages.
   * - Confirms that Create Loadbalancer button is present and enabled.
   * - Confirms that load balancer action menu items are present.
   */
  it('Load Balancers landing page lists each load balancer', () => {
    const chosenRegion = chooseRegion();
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
        regions: ['us-east', chosenRegion.id],
      }),
    ];

    // TODO Delete feature flag mocks when AGLB feature flag goes away.
    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancers(loadbalancerMocks).as('getLoadBalancers');
    mockGetLoadBalancer(loadbalancerMocks[0]);

    cy.visitWithLogin('/loadbalancers');
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getLoadBalancers']);

    loadbalancerMocks.forEach((loadbalancerMock: Loadbalancer) => {
      // Confirm label is shown, and clicking navigates to details page.
      cy.findByText(loadbalancerMock.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          // TODO: AGLB - Confirm that regions from the API are listed for load balancer
          // loadbalancerMock.regions.forEach((loadbalancerRegion: string) => {
          //   const regionLabel = getRegionById(loadbalancerRegion).label;
          //   cy.findByText(regionLabel, { exact: false }).should('be.visible');
          //   cy.findByText(loadbalancerRegion, { exact: false }).should(
          //     'be.visible'
          //   );
          // });

          cy.findByText(loadbalancerMock.hostname).should('be.visible');

          // Confirm that clicking label navigates to details page.
          cy.findByText(loadbalancerMock.label).should('be.visible').click();
        });

      cy.url().should('endWith', `/loadbalancers/${loadbalancerMock.id}`);
      returnToLandingPage();

      cy.findByText(loadbalancerMock.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          // TODO: AGLB - Confirm that regions from the API are listed for load balancer
          // loadbalancerMock.regions.forEach((loadbalancerRegion: string) => {
          //   const regionLabel = getRegionById(loadbalancerRegion).label;
          //   cy.findByText(regionLabel, { exact: false }).should('be.visible');
          //   cy.findByText(loadbalancerRegion, { exact: false }).should(
          //     'be.visible'
          //   );
          // });

          ui.actionMenu
            .findByTitle(
              `Action menu for Load Balancer ${loadbalancerMock.label}`
            )
            .should('be.visible')
            .click();
        });

      // TODO Assert that clicking on the action menu items navigates to the expected page.
      ['Configurations', 'Settings', 'Delete'].forEach(
        (actionMenuItem: string) => {
          ui.actionMenuItem.findByTitle(actionMenuItem).should('be.visible');
        }
      );

      // TODO Assert that clicking button navigates to '/loadbalancers/create'.
      // First we need to dismiss the action menu that's opened above.
      ui.button
        .findByTitle('Create Load Balancer')
        .should('be.visible')
        .should('be.enabled');
    });
  });
});

describe('Delete', () => {
  /*
   * - Confirms that Deleting a load balancer from the AGLB landing page.
   * - Confirms AGLB landing page reverts to its empty state when all of the load balancers have been deleted.
   */
  it('Delete a Load Balancer from landing page.', () => {
    const chosenRegion = chooseRegion();
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
        regions: ['us-east', chosenRegion.id],
      }),
    ];

    // TODO Delete feature flag mocks when AGLB feature flag goes away.
    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancers(loadbalancerMocks).as('getLoadBalancers');
    mockGetLoadBalancer(loadbalancerMocks[0]);

    const loadbalancer = loadbalancerMocks[0];

    cy.visitWithLogin('/loadbalancers');
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getLoadBalancers']);

    ui.actionMenu
      .findByTitle(`Action menu for Load Balancer ${loadbalancer.label}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

    // Mock the API call for deleting the load balancer.
    mockDeleteLoadBalancer(loadbalancer.id).as('deleteLoadBalancer');

    mockGetLoadBalancers([]).as('getLoadBalancers');

    // Handle the delete confirmation dialog.
    ui.dialog
      .findByTitle(`Delete ${loadbalancer.label}?`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Load Balancer Label')
          .should('be.visible')
          .click()
          .type(loadbalancer.label);

        ui.buttonGroup
          .findButtonByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@deleteLoadBalancer', '@getLoadBalancers']);

    // Confirm that user is navigated to the empty loadbalancer empty state landing page.

    cy.get('[data-qa-header]')
      .should('be.visible')
      .should('have.text', 'Global Load Balancers');

    cy.findByText(
      'Scalable Layer 4 and Layer 7 load balancer to route and manage enterprise traffic between clients and your distributed applications and networks globally.'
    ).should('be.visible');
    cy.findByText('Getting Started Guides').should('be.visible');

    // Create button exists and navigates user to create page.
    ui.button
      .findByTitle('Create Global Load Balancer')
      .should('be.visible')
      .should('be.enabled');

    cy.findByText(loadbalancer.label).should('not.exist');
  });

  it('Shows API errors when deleting a load balancer', () => {
    const chosenRegion = chooseRegion();
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
        regions: ['us-east', chosenRegion.id],
      }),
    ];

    // TODO Delete feature flag mocks when AGLB feature flag goes away.
    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLoadBalancers(loadbalancerMocks).as('getLoadBalancers');
    mockGetLoadBalancer(loadbalancerMocks[0]);

    const loadbalancer = loadbalancerMocks[0];

    cy.visitWithLogin('/loadbalancers');
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getLoadBalancers']);

    ui.actionMenu
      .findByTitle(`Action menu for Load Balancer ${loadbalancer.label}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
    // Mock the API call for deleting the load balancer.
    mockDeleteLoadBalancerError(loadbalancer.id, 'Control Plane Error').as(
      'deleteLoadBalancer'
    );

    mockGetLoadBalancers([]).as('getLoadBalancers');

    // Handle the delete confirmation dialog.
    ui.dialog
      .findByTitle(`Delete ${loadbalancer.label}?`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Load Balancer Label')
          .should('be.visible')
          .click()
          .type(loadbalancer.label);

        ui.buttonGroup.findButtonByTitle('Delete').click();

        cy.wait(['@deleteLoadBalancer']);

        cy.findByText('Control Plane Error').should('be.visible');

        ui.buttonGroup.findButtonByTitle('Cancel').click();
      });
  });
});
