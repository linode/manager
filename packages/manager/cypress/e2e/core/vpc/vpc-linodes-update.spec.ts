/**
 * @file Integration tests for VPC assign/unassign Linodes flows.
 */

import {
  mockGetSubnets,
  mockCreateSubnet,
  mockGetVPC,
  mockGetVPCs,
} from 'support/intercepts/vpc';
import {
  subnetFactory,
  vpcFactory,
  linodeFactory,
  linodeConfigFactory,
  LinodeConfigInterfaceFactoryWithVPC,
} from '@src/factories';
import { ui } from 'support/ui';
import { randomNumber, randomLabel } from 'support/util/random';
import { mockGetLinodes } from 'support/intercepts/linodes';
import {
  mockCreateLinodeConfigInterfaces,
  mockGetLinodeConfigs,
  mockDeleteLinodeConfigInterface,
} from 'support/intercepts/configs';
import {
  vpcAssignLinodeRebootNotice,
  vpcUnassignLinodeRebootNotice,
} from 'support/constants/vpc';
import { VPC, Linode, Config } from '@linode/api-v4';

describe('VPC assign/unassign flows', () => {
  let mockVPCs: VPC[];
  let mockLinode: Linode;
  let mockConfig: Config;

  before(() => {
    mockVPCs = vpcFactory.buildList(5);

    mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });

    mockConfig = linodeConfigFactory.build({
      id: randomNumber(),
    });
  });

  /*
   * - Confirms that can assign a Linode to the VPC when feature is enabled.
   */
  it('can assign Linode(s) to a VPC', () => {
    const mockSubnet = subnetFactory.build({
      id: randomNumber(2),
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

    const mockSubnetAfterLinodeAssignment = subnetFactory.build({
      ...mockSubnet,
      linodes: [mockLinode],
    });

    const mockVPCAfterLinodeAssignment = vpcFactory.build({
      ...mockVPCAfterSubnetCreation,
      subnets: [mockSubnetAfterLinodeAssignment],
    });

    mockGetVPCs(mockVPCs).as('getVPCs');
    mockGetVPC(mockVPC).as('getVPC');
    mockGetSubnets(mockVPC.id, []).as('getSubnets');
    mockCreateSubnet(mockVPC.id).as('createSubnet');
    mockGetLinodes([mockLinode]).as('getLinodes');

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
        cy.findByText('Subnet Label')
          .should('be.visible')
          .click()
          .type(mockSubnet.label);

        cy.findByTestId('create-subnet-drawer-button')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@createSubnet', '@getVPC', '@getSubnets', '@getLinodes']);

    // confirm that newly created subnet should now appear on VPC's detail page
    cy.findByText(mockVPC.label).should('be.visible');
    cy.findByText('Subnets (1)').should('be.visible');
    cy.findByText(mockSubnet.label).should('be.visible');

    // assign a linode to the subnet
    ui.actionMenu
      .findByTitle(`Action menu for Subnet ${mockSubnet.label}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem
      .findByTitle('Assign Linodes')
      .should('be.visible')
      .click();

    ui.drawer
      .findByTitle(`Assign Linodes to subnet: ${mockSubnet.label} (0.0.0.0/0)`)
      .should('be.visible')
      .within(() => {
        // confirm that the user is warned that a reboot is required
        cy.findByText(vpcAssignLinodeRebootNotice).should('be.visible');

        ui.button
          .findByTitle('Assign Linode')
          .should('be.visible')
          .should('be.disabled');

        mockGetLinodeConfigs(mockLinode.id, [mockConfig]).as(
          'getLinodeConfigs'
        );
        cy.findByLabelText('Linode')
          .should('be.visible')
          .click()
          .type(mockLinode.label)
          .should('have.value', mockLinode.label);

        ui.autocompletePopper
          .findByTitle(mockLinode.label)
          .should('be.visible')
          .click();

        cy.wait('@getLinodeConfigs');

        mockCreateLinodeConfigInterfaces(mockLinode.id, mockConfig).as(
          'createLinodeConfigInterfaces'
        );
        mockGetVPC(mockVPCAfterLinodeAssignment).as('getVPCLinodeAssignment');
        mockGetSubnets(mockVPC.id, [mockSubnetAfterLinodeAssignment]).as(
          'getSubnetsLinodeAssignment'
        );
        ui.button
          .findByTitle('Assign Linode')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.wait([
          '@createLinodeConfigInterfaces',
          '@getVPCLinodeAssignment',
          '@getSubnetsLinodeAssignment',
        ]);

        ui.button
          .findByTitle('Done')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.get('[data-qa-table-row="collapsible-table-headers-row"]')
      .siblings('tbody')
      .within(() => {
        // after assigning Linode(s) to a VPC, VPC page increases number in 'Linodes' column
        cy.findByText('1').should('be.visible');
      });
  });

  /*
   * - Confirms that can unassign a Linode from the VPC when feature is enabled.
   */
  it('can unassign Linode(s) from a VPC', () => {
    const mockSecondLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });

    const mockSubnet = subnetFactory.build({
      id: randomNumber(2),
      label: randomLabel(),
      linodes: [mockLinode, mockSecondLinode],
    });

    const mockVPC = vpcFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      subnets: [mockSubnet],
    });

    const vpcInterface = LinodeConfigInterfaceFactoryWithVPC.build({
      vpc_id: mockVPC.id,
      subnet_id: mockSubnet.id,
    });
    const mockLinodeConfig = linodeConfigFactory.build({
      interfaces: [vpcInterface],
    });

    const mockLinodeConfigInterfaces = mockLinodeConfig.interfaces ?? [
      vpcInterface,
    ];

    mockGetVPCs(mockVPCs).as('getVPCs');
    mockGetVPC(mockVPC).as('getVPC');
    mockGetSubnets(mockVPC.id, [mockSubnet]).as('getSubnets');
    mockGetLinodes([mockLinode, mockSecondLinode]).as('getLinodes');

    cy.visitWithLogin(`/vpcs/${mockVPC.id}`);
    cy.wait(['@getVPC', '@getSubnets', '@getLinodes']);

    // confirm that subnet should get displayed on VPC's detail page
    cy.findByText(mockVPC.label).should('be.visible');
    cy.findByText('Subnets (1)').should('be.visible');
    cy.findByText(mockSubnet.label).should('be.visible');

    // unassign a linode to the subnet
    ui.actionMenu
      .findByTitle(`Action menu for Subnet ${mockSubnet.label}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem
      .findByTitle('Unassign Linodes')
      .should('be.visible')
      .click();

    ui.drawer
      .findByTitle(
        `Unassign Linodes from subnet: ${mockSubnet.label} (0.0.0.0/0)`
      )
      .should('be.visible')
      .within(() => {
        // confirm that the user is warned that a reboot is required
        cy.findByText(vpcUnassignLinodeRebootNotice).should('be.visible');

        ui.button
          .findByTitle('Unassign Linodes')
          .should('be.visible')
          .should('be.disabled');

        // confirm that unassign a single Linode from the VPC correctly
        mockGetLinodeConfigs(mockLinode.id, [mockLinodeConfig]).as(
          'getLinodeConfigs'
        );

        cy.findByLabelText('Linodes')
          .should('be.visible')
          .click()
          .type(mockLinode.label);

        ui.autocompletePopper
          .findByTitle(mockLinode.label)
          .should('be.visible')
          .click();

        cy.wait('@getLinodeConfigs');

        // the select option won't disappear unless click on somewhere else
        cy.findByText(vpcUnassignLinodeRebootNotice).click();
        // confirm that unassigned Linode(s) are displayed on the details page
        cy.findByText('Linodes to be Unassigned from Subnet (1)').should(
          'be.visible'
        );
        cy.findByText(mockLinode.label).should('be.visible');

        // confirm that unassign multiple Linodes from the VPC correctly
        mockGetLinodeConfigs(mockSecondLinode.id, [mockLinodeConfig]).as(
          'getLinodeConfigs'
        );
        cy.findByText('Linodes')
          .should('be.visible')
          .click()
          .type(mockSecondLinode.label);
        cy.findByText(mockSecondLinode.label).should('be.visible').click();
        cy.wait('@getLinodeConfigs');

        // confirm that unassigned Linode(s) are displayed on the details page
        cy.findByText(vpcUnassignLinodeRebootNotice).click();
        cy.findByText('Linodes to be Unassigned from Subnet (2)').should(
          'be.visible'
        );
        cy.findByText(mockSecondLinode.label).should('be.visible');

        mockDeleteLinodeConfigInterface(
          mockLinode.id,
          mockLinodeConfig.id,
          mockLinodeConfigInterfaces[0].id
        ).as('deleteLinodeConfigInterface1');
        mockDeleteLinodeConfigInterface(
          mockSecondLinode.id,
          mockLinodeConfig.id,
          mockLinodeConfigInterfaces[0].id
        ).as('deleteLinodeConfigInterface2');
        ui.button
          .findByTitle('Unassign Linodes')
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Confirm that click on 'Unassign Linodes' button will send request to update the subnet details on the VPC page.
        cy.wait('@deleteLinodeConfigInterface1')
          .its('response.statusCode')
          .should('eq', 200);
        cy.wait('@deleteLinodeConfigInterface2')
          .its('response.statusCode')
          .should('eq', 200);
      });
  });
});
