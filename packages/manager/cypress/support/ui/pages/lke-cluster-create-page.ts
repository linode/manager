/**
 * @file Page utilities for LKE Cluster create page.
 */
import { ui } from 'support/ui';

import type { KubernetesTier, Region } from '@linode/api-v4';

export const lkeClusterCreatePage = {
  /**
   * Sets the LKE cluster's label.
   *
   * @param clusterLabel - LKE cluster label to set.
   */
  setLabel: (clusterLabel: string) => {
    cy.findByLabelText('Cluster Label').type(`{selectall}{del}${clusterLabel}`);
  },

  /**
   * Selects the LKE cluster tier.
   *
   * This function assumes that the `lkeEnterprise2` feature flag is enabled or
   * is mocked to be enabled.
   *
   * @param clusterTier - LKE cluster tier; either `'standard'` or `'enterprise'`.
   */
  selectClusterTier: (clusterTier: KubernetesTier) => {
    const selectCardHeading =
      clusterTier === 'standard' ? 'LKE' : 'LKE Enterprise';

    cy.get(`[data-qa-select-card-heading="${selectCardHeading}"]`)
      .should('be.visible')
      .click();
  },

  /**
   * Selects the LKE cluster region.
   *
   * If using mocked regions, you may optionally pass an array of mock region objects.
   *
   * @param regionId - ID of region to select.
   * @param searchRegions - Array of mock region objects from which to find the region by ID.
   */
  selectRegionById: (regionId: string, searchRegions?: Region[]) => {
    ui.regionSelect.find().type(regionId);
    ui.regionSelect.findItemByRegionId(regionId, searchRegions).click();
  },

  /**
   * This function assumes that the `apl` and `aplGeneralAvailability` feature flags are both enabled.
   */
  setEnableApl: (enableApl: boolean) => {
    cy.findByTestId('application-platform-form').within(() => {
      const expectedCheckboxLabel = enableApl
        ? 'Yes, enable Akamai App Platform'
        : 'No';

      cy.findByText(expectedCheckboxLabel).should('be.visible').click();
    });
  },

  /**
   * Enables or disables High Availability.
   *
   * @param enableHighAvailability - Whether or not to enable High Availability for the cluster.
   */
  setEnableHighAvailability: (enableHighAvailability: boolean) => {
    cy.findByTestId('ha-control-plane-form').within(() => {
      enableHighAvailability
        ? cy
            .contains('Yes, enable HA control plane.')
            .should('be.visible')
            .should('be.enabled')
            .click()
        : cy.findByText('No').should('be.visible').should('be.enabled').click();
    });
  },

  /**
   * Enables or disables Control Plane ACL feature.
   *
   * @param enableAcl - Whether or not to enable Control Plane ACL for the cluster.
   */
  setEnableControlPlaneAcl: (enableAcl: boolean) => {
    cy.findByTestId('control-plane-ipacl-form').within(() => {
      enableAcl
        ? cy.findByLabelText('Enable Control Plane ACL').check()
        : cy.findByLabelText('Enable Control Plane ACL').uncheck();
    });
  },

  /**
   * Select the Linode plan tab with the given title.
   *
   * @param tabTitle - Title of the tab to select.
   */
  selectPlanTab: (tabTitle: string) => {
    ui.tabList.findTabByTitle(tabTitle).should('be.visible').click();
  },

  /**
   * Selects the given node pool plan for configuration.
   *
   * Assumes that the `lkeEnterprise2.postLa` feature flag is enabled.
   * Assumes that the tab for the desired plan has already been selected. See
   * also `addNodePoolPlan` to select plans when `postLa` is disabled.
   *
   * @param planName - Name of the plan to select (as shown in Cloud's UI) .
   */
  selectNodePoolPlan: (planName: string) => {
    cy.findByText(planName)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Configure Pool')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
  },

  // TODO M3-8838: Delete `addNodePool` function once `lkeEnterprise2` feature flag is retired.
  /**
   * Adds a node pool of the given plan and size.
   *
   * Assumes that the `lkeEnterprise2.postLa` feature flag is disabled.
   *
   * @param planName - Name of the plan to select (as shown in Cloud's UI).
   * @param size - The desired number of nodes for the node pool.
   */
  addNodePool: (planName: string, size: number) => {
    cy.findByText(planName)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.get('input[name="Quantity"]').type(`{selectall}${size}`);
        cy.get('input[name="Quantity"]').should('have.value', `${size}`);
        ui.button
          .findByTitle('Add')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
  },

  /**
   * Sets whether or not to bypass ACL IP address requirement.
   *
   * If `true`, the "Provide an ACL later" checkbox will be checked. Otherwise,
   * the checkbox will be unchecked if needed.
   *
   * Assumes that the user has already enabled Control Plane ACL.
   *
   * @param bypassAcl - Whether or not to bypass the ACL IP address requirement.
   */
  setEnableBypassAcl: (bypassAcl: boolean) => {
    const checkboxLabel =
      'Provide an ACL later. The control plane will be unreachable until an ACL is defined.';
    cy.findByText(checkboxLabel).scrollIntoView();
    cy.findByText(checkboxLabel).should('be.visible');
    bypassAcl
      ? cy.findByLabelText(checkboxLabel).check()
      : cy.findByLabelText(checkboxLabel).uncheck();
  },

  /**
   * Limit Cypress element selection to within the LKE order summary section.
   *
   * @param cb - Callback to execute where Cypress element selection will be scoped to the LKE order summary section.
   */
  withinOrderSummary: (cb: () => void) => {
    cy.get('[data-qa-order-summary]')
      .closest('[data-qa-paper]')
      .within(() => {
        cb();
      });
  },

  /**
   * Limit Cypress element selection to within the LKE node pool configuration drawer.
   *
   * @param planName - Name of plan that node pool drawer is configuring.
   * @param cb - Callback to execute where Cypress element selection will be scoped to the node pool configuration drawer.
   */
  withinNodePoolDrawer: (planName: string, cb: () => void) => {
    ui.drawer
      .findByTitle(`Configure Pool: ${planName} Plan`)
      .should('be.visible')
      .within(() => {
        cb();
      });
  },
};
