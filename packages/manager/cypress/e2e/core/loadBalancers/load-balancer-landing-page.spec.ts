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
import { mockGetLoadBalancers } from 'support/intercepts/load-balancers';
import type { Loadbalancer } from '@linode/api-v4';
import { chooseRegion } from 'support/util/regions';
import { getRegionById } from 'support/util/regions';

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

    cy.visitWithLogin('/loadbalancers');
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getLoadBalancers']);

    loadbalancerMocks.forEach((loadbalancerMock: Loadbalancer) => {
      // Confirm label is shown, and clicking navigates to details page.
      cy.findByText(loadbalancerMock.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          // Confirm that regions are listed for load balancer.
          loadbalancerMock.regions.forEach((loadbalancerRegion: string) => {
            const regionLabel = getRegionById(loadbalancerRegion).label;
            cy.findByText(regionLabel, { exact: false }).should('be.visible');
            cy.findByText(loadbalancerRegion, { exact: false }).should(
              'be.visible'
            );
          });

          // Confirm that clicking label navigates to details page.
          cy.findByText(loadbalancerMock.label).should('be.visible').click();
        });

      cy.url().should('endWith', `/loadbalancers/${loadbalancerMock.id}`);
      returnToLandingPage();

      cy.findByText(loadbalancerMock.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          // Confirm that regions are listed for load balancer.
          loadbalancerMock.regions.forEach((loadbalancerRegion: string) => {
            const regionLabel = getRegionById(loadbalancerRegion).label;
            cy.findByText(regionLabel, { exact: false }).should('be.visible');
            cy.findByText(loadbalancerRegion, { exact: false }).should(
              'be.visible'
            );
          });

          ui.actionMenu
            .findByTitle(`Action menu for Load Balancer ${loadbalancerMock.id}`)
            .should('be.visible')
            .click();
        });

      // TODO Assert that clicking on the action menu items navigates to the expected page.
      ['Configurations', 'Clone Load Balancer', 'Settings', 'Delete'].forEach(
        (actionMenuItem: string) => {
          ui.actionMenuItem.findByTitle(actionMenuItem).should('be.visible');
        }
      );

      // TODO Assert that clicking button navigates to '/loadbalancers/create'.
      // First we need to dismiss the action menu that's opened above.
      ui.button
        .findByTitle('Create Loadbalancer')
        .should('be.visible')
        .should('be.enabled');
    });
  });
});
