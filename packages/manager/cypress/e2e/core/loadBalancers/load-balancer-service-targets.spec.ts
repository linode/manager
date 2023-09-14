/**
 * @file Integration tests related to Cloud Manager AGLB Service Target management.
 */

import {
  linodeFactory,
  loadbalancerFactory,
  serviceTargetFactory,
  certificateFactory,
} from '@src/factories';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import {
  mockGetLoadBalancer,
  mockGetLoadBalancerCertificates,
  mockGetServiceTargets,
  mockCreateServiceTarget,
} from 'support/intercepts/load-balancers';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import type { Linode, ServiceTarget } from '@linode/api-v4';
import { randomLabel, randomIp, randomNumber } from 'support/util/random';
import { ui } from 'support/ui';
import { chooseRegion } from 'support/util/regions';
import { mockGetLinodes } from 'support/intercepts/linodes';

describe('Akamai Global Load Balancer service targets', () => {
  // TODO Remove this `beforeEach()` hook and related `cy.wait()` calls when `aglb` feature flag goes away.
  beforeEach(() => {
    mockAppendFeatureFlags({
      aglb: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
  });

  /*
   * - Confirms that Load Balancer service targets are listed in the "Service Targets" tab.
   */
  it('lists Load Balancer service targets', () => {
    const mockLoadBalancer = loadbalancerFactory.build();
    // const mockServiceTargets = serviceTargetFactory.buildList(5);
    const mockServiceTargets = new Array(5).fill(null).map(
      (_item: null, i: number): ServiceTarget => {
        return serviceTargetFactory.build({
          label: randomLabel(),
        });
      }
    );

    mockGetLoadBalancer(mockLoadBalancer).as('getLoadBalancer');
    mockGetServiceTargets(mockLoadBalancer, mockServiceTargets).as(
      'getServiceTargets'
    );

    cy.visitWithLogin(`/loadbalancers/${mockLoadBalancer.id}/service-targets`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getLoadBalancer',
      '@getServiceTargets',
    ]);

    // Confirm that each service target is listed as expected.
    mockServiceTargets.forEach((serviceTarget: ServiceTarget) => {
      cy.findByText(serviceTarget.label).should('be.visible');
      // TODO Assert that endpoints, health checks, algorithm, and certificates are listed.
    });
  });

  /**
   * - Confirms that service target page shows empty state when there are no service targets.
   * - Confirms that clicking "Create Service Target" opens "Add a Service Target" drawer.
   * - Confirms that "Add a Service Target" drawer can be cancelled.
   * - Confirms that endpoints can be selected via Linode label and via IP address.
   * - Confirms that health check can be disabled or re-enabled, and UI responds to toggle.
   * - [TODO] Confirms that service target list updates to reflect created service target.
   */
  it.only('can create a Load Balancer service target', () => {
    const loadBalancerRegion = chooseRegion();
    const mockLinodes = new Array(2).fill(null).map(
      (_item: null, _i: number): Linode => {
        return linodeFactory.build({
          label: randomLabel(),
          region: loadBalancerRegion.id,
          ipv4: [randomIp()],
        });
      }
    );

    const mockLoadBalancer = loadbalancerFactory.build({
      regions: [loadBalancerRegion.id],
    });
    const mockServiceTarget = serviceTargetFactory.build({
      label: randomLabel(),
    });
    const mockCertificate = certificateFactory.build({
      label: randomLabel(),
    });

    mockGetLinodes(mockLinodes);
    mockGetLoadBalancer(mockLoadBalancer).as('getLoadBalancer');
    mockGetServiceTargets(mockLoadBalancer, []).as('getServiceTargets');
    mockGetLoadBalancerCertificates(mockLoadBalancer.id, [mockCertificate]);

    cy.visitWithLogin(`/loadbalancers/${mockLoadBalancer.id}/service-targets`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getLoadBalancer',
      '@getServiceTargets',
    ]);

    cy.findByText('No items to display.');

    ui.button
      .findByTitle('Create Service Target')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm that drawer can be closed.
    ui.drawer
      .findByTitle('Add a Service Target')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Cancel')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.get('[data-qa-drawer]').should('not.exist');

    // Re-open "Add a Service Target" drawer.
    ui.button
      .findByTitle('Create Service Target')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Fill out service target drawer, click "Create Service Target".
    mockCreateServiceTarget(mockLoadBalancer, mockServiceTarget).as(
      'createServiceTarget'
    );
    ui.drawer
      .findByTitle('Add a Service Target')
      .should('be.visible')
      .within(() => {
        cy.findByText('Service Target Label')
          .should('be.visible')
          .click()
          .type(mockServiceTarget.label);

        // Fill out the first endpoint using the mocked Linode's label.
        cy.get('[data-qa-endpoint]')
          .should('be.visible')
          .within(() => {
            cy.findByText('Linode or Public IP Address')
              .should('be.visible')
              .click()
              .type(`${mockLinodes[0].label}`);

            ui.autocompletePopper
              .findByTitle(mockLinodes[0].label)
              .should('be.visible')
              .click();
          });

        // Add a second endpoint.
        ui.button
          .findByTitle('Add Another Endpoint')
          .should('be.visible')
          .click();

        // Fill out the second endpoint using the mocked Linode's IP address,
        // then select the Linode from the autocomplete popper.
        cy.get('[data-qa-endpoint="1"]')
          .scrollIntoView()
          .should('be.visible')
          .within(() => {
            cy.findByText('Linode or Public IP Address')
              .should('be.visible')
              .click()
              .type(mockLinodes[1].ipv4[0]);

            ui.autocompletePopper
              .findByTitle(mockLinodes[1].label)
              .should('be.visible')
              .click();
          });

        // Select the certificate mocked for this load balancer.
        cy.findByText('Certificate').click().type(mockCertificate.label);

        ui.autocompletePopper
          .findByTitle(mockCertificate.label)
          .should('be.visible')
          .click();

        // Confirm that health check options are hidden when health check is disabled.
        cy.findByText('Use Health Checks').should('be.visible').click();

        cy.get('[data-qa-healthcheck-options]').should('not.exist');

        // Re-enable health check, fill out form.
        cy.findByText('Use Health Checks')
          .scrollIntoView()
          .should('be.visible')
          .click();

        cy.get('[data-qa-healthcheck-options]')
          .scrollIntoView()
          .should('be.visible');

        ui.button
          .findByTitle('Create Service Target')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.wait('@createServiceTarget');

    // TODO Assert that new service target is listed.
    // cy.findByText('No items to display.').should('not.exist');
    // cy.findByText(mockServiceTarget.label).should('not.exist');
  });
});
