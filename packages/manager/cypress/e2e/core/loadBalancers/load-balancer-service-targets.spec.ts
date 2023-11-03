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
  mockUpdateServiceTarget,
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
  it('can create a Load Balancer service target', () => {
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
        cy.findByText('Linode or Public IP Address')
          .should('be.visible')
          .click()
          .type(mockLinodes[0].label);

        ui.autocompletePopper
          .findByTitle(mockLinodes[0].label)
          .should('be.visible')
          .click();

        ui.button.findByTitle('Add Endpoint').should('be.visible').click();

        // Verify the first endpoint was added to the table
        cy.findByText(mockLinodes[0].label, { exact: false })
          .scrollIntoView()
          .should('be.visible');

        // Create another endpoint
        cy.findByText('Linode or Public IP Address')
          .should('be.visible')
          .click()
          .type(mockLinodes[1].ipv4[0]);

        ui.autocompletePopper
          .findByTitle(mockLinodes[1].label)
          .should('be.visible')
          .click();

        ui.button.findByTitle('Add Endpoint').should('be.visible').click();

        // Verify the second endpoint was added to the table
        cy.findByText(mockLinodes[1].label, { exact: false })
          .scrollIntoView()
          .should('be.visible');

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

  /**
   * - Confirms that clicking a service target's Edit action opens "Edit Service Target" drawer.
   * - Confirms that "Edit Service Target" drawer can be cancelled.
   * - Confirms that form fields are pre-populated with service target data.
   * - [TODO] Confirms that service target list updates to reflect updated service target.
   */
  it('can edit a Load Balancer service target', () => {
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
      ca_certificate: 'my-certificate',
      load_balancing_policy: 'random',
    });
    const mockCertificate = certificateFactory.build({
      label: 'my-certificate',
    });
    const mockNewCertificate = certificateFactory.build({
      label: 'my-new-certificate',
    });

    mockGetLinodes(mockLinodes);
    mockGetLoadBalancer(mockLoadBalancer).as('getLoadBalancer');
    mockGetServiceTargets(mockLoadBalancer, mockServiceTarget).as(
      'getServiceTargets'
    );
    mockGetLoadBalancerCertificates(mockLoadBalancer.id, [
      mockCertificate,
      mockNewCertificate,
    ]);

    cy.visitWithLogin(`/loadbalancers/${mockLoadBalancer.id}/service-targets`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientStream',
      '@getLoadBalancer',
      '@getServiceTargets',
    ]);

    // Open the "Edit Service Target" drawer via the action menu item.
    ui.actionMenu
      .findByTitle(`Action Menu for service target ${mockServiceTarget.label}`)
      .click();
    ui.actionMenuItem.findByTitle('Edit').click();

    // Confirm that drawer can be closed.
    ui.drawer
      .findByTitle(`Edit ${mockServiceTarget.label}`)
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

    // Re-open drawer and modify service target, then click "Save Service Target".
    ui.actionMenu
      .findByTitle(`Action Menu for service target ${mockServiceTarget.label}`)
      .click();
    ui.actionMenuItem.findByTitle('Edit').click();

    mockUpdateServiceTarget(mockLoadBalancer, mockServiceTarget).as(
      'updateServiceTarget'
    );

    ui.drawer
      .findByTitle(`Edit ${mockServiceTarget.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Service Target Label')
          .should('have.value', mockServiceTarget.label)
          .clear()
          .type('my-updated-service-target-label');

        // Confirm the load balancing policy selection matches that of the service target, then change the policy.
        cy.findByLabelText('Algorithm')
          .should('have.value', 'Random')
          .clear()
          .type('Ring Hash');

        ui.autocompletePopper
          .findByTitle('Ring Hash')
          .should('be.visible')
          .click();

        // Confirm the endpoint is populated in the table.
        cy.findByText(
          `${mockServiceTarget.endpoints[0].ip}:${mockServiceTarget.endpoints[0].port}`,
          { exact: false }
        )
          .scrollIntoView()
          .should('be.visible');

        // Confirm the endpoint can be deleted.
        cy.findByLabelText(
          `Remove Endpoint ${mockServiceTarget.endpoints[0].ip}:${mockServiceTarget.endpoints[0].port}`,
          { exact: false }
        ).click();

        // Confirm endpoint empty state text is visible without any endpoints.
        cy.findByText('No endpoints to display.')
          .scrollIntoView()
          .should('be.visible');

        // Select the certificate mocked for this load balancer.
        cy.findByLabelText('Certificate')
          .should('have.value', mockServiceTarget.ca_certificate)
          .clear()
          .type('my-new-certificate');

        ui.autocompletePopper
          .findByTitle('my-new-certificate')
          .should('be.visible')
          .click();

        // Confirm that health check options match service target data.
        cy.findByLabelText('Interval').should(
          'have.value',
          mockServiceTarget.healthcheck.interval
        );

        cy.findByLabelText('Timeout').should(
          'have.value',
          mockServiceTarget.healthcheck.timeout
        );

        cy.findByLabelText('Healthy Threshold').should(
          'have.value',
          mockServiceTarget.healthcheck.healthy_threshold
        );

        cy.findByLabelText('Unhealthy Threshold').should(
          'have.value',
          mockServiceTarget.healthcheck.unhealthy_threshold
        );

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

        // Confirm that health check options are restored to defaults after toggle.
        cy.findByLabelText('Interval').should('have.value', 10);

        cy.findByLabelText('Timeout').should('have.value', 5000);

        cy.findByLabelText('Healthy Threshold').should('have.value', 5);

        cy.findByLabelText('Unhealthy Threshold').should('have.value', 5);

        //Confirm that health check path and host match service target data.
        cy.findByLabelText('Health Check Path', { exact: false }).should(
          'have.value',
          mockServiceTarget.healthcheck.path
        );

        cy.findByLabelText('Health Check Host', { exact: false }).should(
          'have.value',
          mockServiceTarget.healthcheck.host
        );

        // Confirm the primary action button exists and is enabled.
        ui.button
          .findByTitle('Save Service Target')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.wait('@updateServiceTarget');

    // TODO Assert that new service target is listed.
    // cy.findByText('No items to display.').should('not.exist');
    // cy.findByText(mockServiceTarget.label).should('not.exist');
  });
});
