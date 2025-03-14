import {
  linodeConfigInterfaceFactory,
  linodeConfigInterfaceFactoryWithVPC,
  linodeFactory,
} from '@linode/utilities';
import { linodeConfigFactory, subnetFactory, vpcFactory } from '@src/factories';
import { mockGetLinodeConfigs } from 'support/intercepts/configs';
import { mockGetLinodeDetails } from 'support/intercepts/linodes';
import {
  mockCreateSubnet,
  mockDeleteSubnet,
  mockDeleteVPC,
  mockEditSubnet,
  mockGetSubnets,
  mockGetVPC,
  mockGetVPCs,
  mockUpdateVPC,
} from 'support/intercepts/vpc';
import { ui } from 'support/ui';
import { randomLabel, randomNumber, randomPhrase } from 'support/util/random';
import { getRegionById } from 'support/util/regions';
import { chooseRegion } from 'support/util/regions';

import { WARNING_ICON_UNRECOMMENDED_CONFIG } from 'src/features/VPCs/constants';

import type { VPC } from '@linode/api-v4';

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
      description: randomPhrase(),
      label: randomLabel(),
    };

    const vpcRegion = getRegionById(mockVPC.region);

    mockGetVPC(mockVPC).as('getVPC');
    mockUpdateVPC(mockVPC.id, mockVPCUpdated).as('updateVPC');
    mockDeleteVPC(mockVPC.id).as('deleteVPC');

    cy.visitWithLogin(`/vpcs/${mockVPC.id}`);
    cy.wait('@getVPC');

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
        cy.findByLabelText('Label').should('be.visible').click();
        cy.focused().clear();
        cy.focused().type(mockVPCUpdated.label);

        cy.findByLabelText('Description').should('be.visible').click();
        cy.focused().clear();
        cy.focused().type(mockVPCUpdated.description);

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
        cy.findByLabelText('VPC Label').should('be.visible').click();
        cy.focused().type(mockVPCUpdated.label);

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
    cy.findByText('Create a private and isolated network');
  });

  /**
   * - Confirms UI flow when creating a subnet on a VPC's detail page.
   * - Confirms UI flow for editing a subnet.
   * - Confirms Subnets section and table is shown on the VPC details page.
   * - Confirms UI flow when deleting a subnet from a VPC's detail page.
   */
  it('can create, edit, and delete a subnet from the VPC details page', () => {
    // create a subnet
    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      linodes: [],
    });

    const mockVPC = vpcFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });

    const mockVPCAfterSubnetCreation = vpcFactory.build({
      ...mockVPC,
      subnets: [mockSubnet],
    });

    mockGetVPC(mockVPC).as('getVPC');
    mockGetSubnets(mockVPC.id, []).as('getSubnets');
    mockCreateSubnet(mockVPC.id).as('createSubnet');

    cy.visitWithLogin(`/vpcs/${mockVPC.id}`);
    cy.wait(['@getVPC', '@getSubnets']);

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
        cy.findByText('Subnet Label').should('be.visible').click();
        cy.focused().type(mockSubnet.label);

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

    // edit a subnet
    const mockEditedSubnet = subnetFactory.build({
      ...mockSubnet,
      label: randomLabel(),
    });

    const mockVPCAfterSubnetEdited = vpcFactory.build({
      ...mockVPC,
      subnets: [mockEditedSubnet],
    });

    // confirm that subnet can be edited and that page reflects changes
    mockEditSubnet(mockVPC.id, mockEditedSubnet.id, mockEditedSubnet).as(
      'editSubnet'
    );
    mockGetVPC(mockVPCAfterSubnetEdited).as('getVPC');
    mockGetSubnets(mockVPC.id, [mockEditedSubnet]).as('getSubnets');

    ui.actionMenu
      .findByTitle(`Action menu for Subnet ${mockSubnet.label}`)
      .should('be.visible')
      .click();
    ui.actionMenuItem.findByTitle('Edit').should('be.visible').click();

    ui.drawer
      .findByTitle('Edit Subnet')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label').should('be.visible').click();
        cy.focused().clear();
        cy.focused().type(mockEditedSubnet.label);

        cy.findByLabelText('Subnet IP Address Range')
          .should('be.visible')
          .should('not.be.enabled');

        cy.findByTestId('save-button')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that edited subnet info displays
    cy.wait(['@editSubnet', '@getVPC', '@getSubnets']);
    cy.findByText(mockVPC.label).should('be.visible');
    cy.findByText('Subnets (1)').should('be.visible');
    cy.findByText(mockEditedSubnet.label).should('be.visible');

    // delete a subnet
    const mockVPCAfterSubnetDeletion = vpcFactory.build({
      ...mockVPC,
      subnets: [],
    });
    mockDeleteSubnet(mockVPC.id, mockEditedSubnet.id).as('deleteSubnet');

    // confirm that subnet can be deleted and that page reflects changes
    ui.actionMenu
      .findByTitle(`Action menu for Subnet ${mockEditedSubnet.label}`)
      .should('be.visible')
      .click();
    ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

    mockGetVPC(mockVPCAfterSubnetDeletion).as('getVPC');
    mockGetSubnets(mockVPC.id, []).as('getSubnets');

    ui.dialog
      .findByTitle(`Delete Subnet ${mockEditedSubnet.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Subnet Label').should('be.visible').click();
        cy.focused().type(mockEditedSubnet.label);

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
    cy.findByText(mockEditedSubnet.label).should('not.exist');
  });

  /**
   * - Confirms UI for Linode with a recommended config (no notice displayed)
   */
  it('does not display an unrecommended config notice for a Linode', () => {
    const linodeRegion = chooseRegion({ capabilities: ['VPCs'] });

    const mockInterfaceId = randomNumber();
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
    });

    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      ipv4: '10.0.0.0/24',
      label: randomLabel(),
      linodes: [
        {
          id: mockLinode.id,
          interfaces: [{ active: true, id: mockInterfaceId }],
        },
      ],
    });

    const mockVPC = vpcFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
      subnets: [mockSubnet],
    });

    const mockInterface = linodeConfigInterfaceFactoryWithVPC.build({
      active: true,
      primary: true,
      subnet_id: mockSubnet.id,
      vpc_id: mockVPC.id,
    });

    const mockLinodeConfig = linodeConfigFactory.build({
      interfaces: [mockInterface],
    });

    mockGetVPC(mockVPC).as('getVPC');
    mockGetSubnets(mockVPC.id, [mockSubnet]).as('getSubnets');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeConfigs(mockLinode.id, [mockLinodeConfig]).as(
      'getLinodeConfigs'
    );

    cy.visitWithLogin(`/vpcs/${mockVPC.id}`);
    cy.findByLabelText(`expand ${mockSubnet.label} row`).click();
    cy.wait('@getLinodeConfigs');
    cy.findByTestId(WARNING_ICON_UNRECOMMENDED_CONFIG).should('not.exist');
  });

  /**
   * - Confirms UI for Linode with a config with an implicit primary VPC interface (no notice)
   */
  it('does not display an unrecommended config notice for a Linode with an implicit primary VPC', () => {
    const linodeRegion = chooseRegion({ capabilities: ['VPCs'] });

    const mockInterfaceId = randomNumber();
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
    });

    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      ipv4: '10.0.0.0/24',
      label: randomLabel(),
      linodes: [
        {
          id: mockLinode.id,
          interfaces: [{ active: true, id: mockInterfaceId }],
        },
      ],
    });

    const mockVPC = vpcFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
      subnets: [mockSubnet],
    });

    const mockInterface = linodeConfigInterfaceFactoryWithVPC.build({
      active: true,
      id: mockInterfaceId,
      primary: false,
      subnet_id: mockSubnet.id,
      vpc_id: mockVPC.id,
    });

    const mockLinodeConfig = linodeConfigFactory.build({
      interfaces: [mockInterface],
    });

    mockGetVPC(mockVPC).as('getVPC');
    mockGetSubnets(mockVPC.id, [mockSubnet]).as('getSubnets');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeConfigs(mockLinode.id, [mockLinodeConfig]).as(
      'getLinodeConfigs'
    );

    cy.visitWithLogin(`/vpcs/${mockVPC.id}`);
    cy.findByLabelText(`expand ${mockSubnet.label} row`).click();
    cy.wait('@getLinodeConfigs');
    cy.findByTestId(WARNING_ICON_UNRECOMMENDED_CONFIG).should('not.exist');
  });

  /**
   * - Confirms UI for Linode with an unrecommended config (notice displayed)
   */
  it('displays an unrecommended config notice for a Linode', () => {
    const linodeRegion = chooseRegion({ capabilities: ['VPCs'] });

    const mockInterfaceId = randomNumber();
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
    });

    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      ipv4: '10.0.0.0/24',
      label: randomLabel(),
      linodes: [
        {
          id: mockLinode.id,
          interfaces: [{ active: true, id: mockInterfaceId }],
        },
      ],
    });

    const mockVPC = vpcFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
      subnets: [mockSubnet],
    });

    const mockPrimaryInterface = linodeConfigInterfaceFactory.build({
      active: false,
      primary: true,
      purpose: 'public',
    });

    const mockInterface = linodeConfigInterfaceFactoryWithVPC.build({
      active: true,
      id: mockInterfaceId,
      primary: false,
      subnet_id: mockSubnet.id,
      vpc_id: mockVPC.id,
    });

    const mockLinodeConfig = linodeConfigFactory.build({
      interfaces: [mockInterface, mockPrimaryInterface],
    });

    mockGetVPC(mockVPC).as('getVPC');
    mockGetSubnets(mockVPC.id, [mockSubnet]).as('getSubnets');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeConfigs(mockLinode.id, [mockLinodeConfig]).as(
      'getLinodeConfigs'
    );

    cy.visitWithLogin(`/vpcs/${mockVPC.id}`);
    cy.findByLabelText(`expand ${mockSubnet.label} row`).click();
    cy.wait('@getLinodeConfigs');
    cy.findByTestId(WARNING_ICON_UNRECOMMENDED_CONFIG).should('exist');
  });
});
