import {
  mockGetVPC,
  mockGetVPCs,
  mockDeleteVPC,
  mockUpdateVPC,
  mockCreateSubnet,
  mockDeleteSubnet,
  mockGetSubnets,
} from 'support/intercepts/vpc';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { subnetFactory, vpcFactory } from '@src/factories';
import { randomLabel, randomNumber, randomPhrase } from 'support/util/random';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import type { VPC } from '@linode/api-v4';
import { getRegionById } from 'support/util/regions';
import { ui } from 'support/ui';

describe('VPC details page', () => {
  /**
   * - Confirms that VPC details pages can be visited.
   * - Confirms that VPC details pages show VPC information.
   * - Confirms UI flow when editing a VPC from details page.
   * - Confirms UI flow when deleting a VPC from details page.
   */
  it('can edit and delete a VPC from the VPC details page', () => {
    const mockVPC: VPC = vpcFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });

    const mockVPCUpdated = {
      ...mockVPC,
      label: randomLabel(),
      description: randomPhrase(),
    };

    const vpcRegion = getRegionById(mockVPC.region);

    mockAppendFeatureFlags({
      vpc: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetVPC(mockVPC).as('getVPC');
    mockUpdateVPC(mockVPC.id, mockVPCUpdated).as('updateVPC');
    mockDeleteVPC(mockVPC.id).as('deleteVPC');

    cy.visitWithLogin(`/vpcs/${mockVPC.id}`);
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getVPC']);

    // Confirm that VPC details are displayed.
    cy.findByText(mockVPC.label).should('be.visible');
    cy.findByText(vpcRegion.label).should('be.visible');

    // Confirm that VPC can be updated and that page reflects changes.
    ui.button
      .findByTitle('Edit')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Edit VPC')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label')
          .should('be.visible')
          .click()
          .clear()
          .type(mockVPCUpdated.label);

        cy.findByLabelText('Description')
          .should('be.visible')
          .click()
          .clear()
          .type(mockVPCUpdated.description);

        ui.button
          .findByTitle('Save')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@updateVPC');
    cy.findByText(mockVPCUpdated.label).should('be.visible');
    cy.findByText(mockVPCUpdated.description).should('be.visible');

    // Confirm that VPC can be deleted and user is redirected to landing page.
    ui.button
      .findByTitle('Delete')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.dialog
      .findByTitle(`Delete VPC ${mockVPCUpdated.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('VPC Label')
          .should('be.visible')
          .click()
          .type(mockVPCUpdated.label);

        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    mockGetVPCs([]).as('getVPCs');
    cy.wait(['@deleteVPC', '@getVPCs']);

    // Confirm that user is redirected to VPC landing page.
    cy.url().should('endWith', '/vpcs');
    cy.findByText('Create a private and isolated network.');
  });

  /**
   * - Confirms Subnets section and table is shown on the VPC details page
   * - Confirms UI flow when deleting a subnet from a VPC's detail page
   */
  it('can delete a subnet from the VPC details page', () => {
    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });
    const mockVPC = vpcFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      subnets: [mockSubnet],
    });

    const mockVPCAfterSubnetDeletion = vpcFactory.build({
      ...mockVPC,
      subnets: [],
    });

    mockAppendFeatureFlags({
      vpc: makeFeatureFlagData(true),
    }).as('getFeatureFlags');

    mockGetVPC(mockVPC).as('getVPC');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetSubnets(mockVPC.id, [mockSubnet]).as('getSubnets');
    mockDeleteSubnet(mockVPC.id, mockSubnet.id).as('deleteSubnet');

    cy.visitWithLogin(`/vpcs/${mockVPC.id}`);
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getVPC', '@getSubnets']);

    // confirm that vpc and subnet details get displayed
    cy.findByText(mockVPC.label).should('be.visible');
    cy.findByText('Subnets (1)').should('be.visible');
    cy.findByText(mockSubnet.label).should('be.visible');

    // confirm that subnet can be deleted and that page reflects changes
    ui.actionMenu
      .findByTitle(`Action menu for Subnet ${mockSubnet.label}`)
      .should('be.visible')
      .click();
    ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

    mockGetVPC(mockVPCAfterSubnetDeletion).as('getVPC');
    mockGetSubnets(mockVPC.id, []).as('getSubnets');

    ui.dialog
      .findByTitle(`Delete Subnet ${mockSubnet.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Subnet label')
          .should('be.visible')
          .click()
          .type(mockSubnet.label);

        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@deleteSubnet', '@getVPC', '@getSubnets']);

    // confirm that user should still be on VPC's detail page
    // confirm there are no remaining subnets
    cy.url().should('endWith', `/${mockVPC.id}`);
    cy.findByText('Subnets (0)');
    cy.findByText('No Subnets are assigned.');
    cy.findByText(mockSubnet.label).should('not.exist');
  });

  /**
   * - Confirms UI flow when creating a subnet on a VPC's detail page.
   */
  it('can create a subnet', () => {
    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });

    const mockVPC = vpcFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });

    const mockVPCAfterSubnetCreation = vpcFactory.build({
      ...mockVPC,
      subnets: [mockSubnet],
    });

    mockAppendFeatureFlags({
      vpc: makeFeatureFlagData(true),
    }).as('getFeatureFlags');

    mockGetVPC(mockVPC).as('getVPC');
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetSubnets(mockVPC.id, []).as('getSubnets');
    mockCreateSubnet(mockVPC.id).as('createSubnet');

    cy.visitWithLogin(`/vpcs/${mockVPC.id}`);
    cy.wait(['@getFeatureFlags', '@getClientStream', '@getVPC', '@getSubnets']);

    // confirm that vpc and subnet details get displayed
    cy.findByText(mockVPC.label).should('be.visible');
    cy.findByText('Subnets (0)');
    cy.findByText('No Subnets are assigned.');

    ui.button.findByTitle('Create Subnet').should('be.visible').click();

    mockGetVPC(mockVPCAfterSubnetCreation).as('getVPC');
    mockGetSubnets(mockVPC.id, [mockSubnet]).as('getSubnets');

    ui.drawer
      .findByTitle('Create Subnet')
      .should('be.visible')
      .within(() => {
        cy.findByText('Subnet label')
          .should('be.visible')
          .click()
          .type(mockSubnet.label);

        cy.findByTestId('create-subnet-drawer-button')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@createSubnet', '@getVPC', '@getSubnets']);

    // confirm that newly created subnet should now appear on VPC's detail page
    cy.findByText(mockVPC.label).should('be.visible');
    cy.findByText('Subnets (1)').should('be.visible');
    cy.findByText(mockSubnet.label).should('be.visible');
  });
});
