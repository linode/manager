import { ui } from 'support/ui';

/**
 * Page utilities for interacting with the VPC create drawer.
 *
 * Assumes that selection context is limited to only the drawer.
 */
export const vpcCreateDrawer = {
  /**
   * Sets the VPC create form's label field.
   *
   * @param vpcLabel - VPC label to set.
   */
  setLabel: (vpcLabel: string) => {
    cy.findByLabelText('VPC Label')
      .should('be.visible')
      .type(`{selectall}{del}${vpcLabel}`);
  },

  /**
   * Sets the VPC create form's description field.
   *
   * @param vpcDescription - VPC description to set.
   */
  setDescription: (vpcDescription: string) => {
    cy.findByLabelText('Description', { exact: false })
      .should('be.visible')
      .type(`{selectall}{del}${vpcDescription}`);
  },

  /**
   * Sets the VPC create form's subnet label.
   *
   * When handling more than one subnet, an index can be provided to control
   * which field is being modified.
   *
   * @param subnetLabel - Label to set.
   * @param subnetIndex - Optional index of subnet for which to update label.
   */
  setSubnetLabel: (subnetLabel: string, subnetIndex: number = 0) => {
    cy.findByText('Subnet Label', {
      selector: `label[for="subnet-label-${subnetIndex}"]`,
    })
      .should('be.visible')
      .click();

    cy.focused().type(`{selectall}{del}${subnetLabel}`);
  },

  /**
   * Sets the VPC create form's subnet IP address.
   *
   * When handling more than one subnet, an index can be provided to control
   * which field is being modified.
   *
   * @param subnetIpRange - IP range to set.
   * @param subnetIndex - Optional index of subnet for which to update IP range.
   */
  setSubnetIpRange: (subnetIpRange: string, subnetIndex: number = 0) => {
    cy.findByText('Subnet IP Address Range', {
      selector: `label[for="subnet-ipv4-${subnetIndex}"]`,
    })
      .should('be.visible')
      .click();

    cy.focused().type(`{selectall}{del}${subnetIpRange}`);
  },

  /**
   * Submits the VPC create form.
   */
  submit: () => {
    ui.buttonGroup
      .findButtonByTitle('Create VPC')
      .scrollIntoView()
      .should('be.visible')
      .should('be.enabled')
      .click();
  },
};
