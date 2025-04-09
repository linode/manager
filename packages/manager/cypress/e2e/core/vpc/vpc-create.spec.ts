/**
 * @file Integration tests for VPC create flow.
 */

import type { Subnet, VPC } from '@linode/api-v4';
import {
  vpcFactory,
  subnetFactory,
  linodeFactory,
  regionFactory,
} from '@src/factories';
import { mockGetRegions } from 'support/intercepts/regions';
import {
  mockCreateVPCError,
  mockCreateVPC,
  mockGetSubnets,
} from 'support/intercepts/vpc';
import {
  randomLabel,
  randomPhrase,
  randomIp,
  randomNumber,
  randomString,
} from 'support/util/random';
import { ui } from 'support/ui';
import { buildArray } from 'support/util/arrays';
import { getUniqueLinodesFromSubnets } from 'src/features/VPCs/utils';
import { extendRegion } from 'support/util/regions';

/**
 * Gets the "Add another Subnet" section with the given index.
 *
 * @returns Cypress chainable.
 */
const getSubnetNodeSection = (index: number) => {
  return cy.get(`[data-qa-subnet-node="${index}"]`);
};

describe('VPC create flow', () => {
  /*
   * - Confirms VPC creation flow using mock API data.
   * - Confirms that users can create and delete subnets.
   * - Confirms client side validation when entering invalid IP ranges.
   * - Confirms that UI handles API errors gracefully.
   * - Confirms that UI redirects to created VPC page after creating a VPC.
   */
  it('can create a VPC', () => {
    const mockVPCRegion = extendRegion(
      regionFactory.build({
        capabilities: ['VPCs'],
      })
    );

    const mockSubnets: Subnet[] = buildArray(3, (index: number) => {
      return subnetFactory.build({
        label: randomLabel(),
        id: randomNumber(10000, 99999),
        ipv4: `${randomIp()}/${randomNumber(0, 32)}`,
        linodes: linodeFactory.buildList(index + 1),
      });
    });

    const mockSubnetToDelete: Subnet = subnetFactory.build();
    const mockInvalidIpRange = `${randomIp()}/${randomNumber(33, 100)}`;

    const mockVpc: VPC = vpcFactory.build({
      id: randomNumber(10000, 99999),
      label: randomLabel(),
      region: mockVPCRegion.id,
      description: randomPhrase(),
      subnets: mockSubnets,
    });

    const ipValidationErrorMessage1 = 'A subnet must have an IPv4 range.';
    const ipValidationErrorMessage2 = 'The IPv4 range must be in CIDR format.';
    const vpcCreationErrorMessage = 'An unknown error has occurred.';
    const totalSubnetUniqueLinodes = getUniqueLinodesFromSubnets(mockSubnets);

    mockGetRegions([mockVPCRegion]).as('getRegions');

    cy.visitWithLogin('/vpcs/create');
    cy.wait('@getRegions');

    ui.regionSelect.find().click().type(`${mockVPCRegion.label}{enter}`);

    cy.findByText('VPC Label').should('be.visible').click().type(mockVpc.label);

    cy.findByText('Description')
      .should('be.visible')
      .click()
      .type(mockVpc.description);

    // Fill out the first Subnet.
    // Insert an invalid empty IP range to confirm client side validation.
    getSubnetNodeSection(0)
      .should('be.visible')
      .within(() => {
        cy.findByText('Subnet Label')
          .should('be.visible')
          .click()
          .type(mockSubnets[0].label);

        cy.findByText('Subnet IP Address Range')
          .should('be.visible')
          .click()
          .type(`{selectAll}{backspace}`);
      });

    ui.button
      .findByTitle('Create VPC')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.findByText(ipValidationErrorMessage1).should('be.visible');

    // Enter a random non-IP address string to further test client side validation.
    cy.findByText('Subnet IP Address Range')
      .should('be.visible')
      .click()
      .type(`{selectAll}{backspace}`)
      .type(randomString(18));

    ui.button
      .findByTitle('Create VPC')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.findByText(ipValidationErrorMessage2).should('be.visible');

    // Enter a valid IP address with an invalid network prefix to further test client side validation.
    cy.findByText('Subnet IP Address Range')
      .should('be.visible')
      .click()
      .type(`{selectAll}{backspace}`)
      .type(mockInvalidIpRange);

    ui.button
      .findByTitle('Create VPC')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.findByText(ipValidationErrorMessage2).should('be.visible');

    // Replace invalid IP address range with valid range.
    cy.findByText('Subnet IP Address Range')
      .should('be.visible')
      .click()
      .type(`{selectAll}{backspace}`)
      .type(mockSubnets[0].ipv4!);

    // Add another subnet that we will remove later.
    ui.button
      .findByTitle('Add another Subnet')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Fill out subnet section, but leave label blank, then attempt to create
    // VPC with missing subnet label.
    getSubnetNodeSection(1)
      .should('be.visible')
      .within(() => {
        cy.findByText('Subnet IP Address Range')
          .should('be.visible')
          .click()
          .type(`{selectAll}{backspace}`)
          .type(mockSubnetToDelete.ipv4!);
      });

    ui.button
      .findByTitle('Create VPC')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm that label validation message is displayed, then remove the
    // subnet and confirm that UI responds accordingly.
    getSubnetNodeSection(1)
      .should('be.visible')
      .within(() => {
        cy.findByText('Label must be between 1 and 64 characters.').should(
          'be.visible'
        );

        // Delete subnet.
        cy.findByLabelText('Remove Subnet 1')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    getSubnetNodeSection(1).should('not.exist');
    cy.findByText(mockSubnetToDelete.label).should('not.exist');

    // Continue adding remaining subnets.
    mockSubnets.slice(1).forEach((mockSubnet: Subnet, index: number) => {
      ui.button
        .findByTitle('Add another Subnet')
        .should('be.visible')
        .should('be.enabled')
        .click();

      getSubnetNodeSection(index + 1)
        .should('be.visible')
        .within(() => {
          cy.findByText('Subnet Label')
            .should('be.visible')
            .click()
            .type(mockSubnet.label);

          cy.findByText('Subnet IP Address Range')
            .should('be.visible')
            .click()
            .type(`{selectAll}{backspace}`)
            .type(`${randomIp()}/${randomNumber(0, 32)}`);
        });
    });

    // Click "Create VPC", mock an HTTP 500 error and confirm UI displays the message.
    mockCreateVPCError(vpcCreationErrorMessage).as('createVPC');
    ui.button
      .findByTitle('Create VPC')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createVPC');
    cy.findByText(vpcCreationErrorMessage).should('be.visible');

    // Click "Create VPC", mock a successful response and confirm that Cloud
    // redirects to the VPC details page for the new VPC.
    mockCreateVPC(mockVpc).as('createVPC');
    mockGetSubnets(mockVpc.id, mockVpc.subnets).as('getSubnets');
    ui.button
      .findByTitle('Create VPC')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createVPC');
    cy.url().should('endWith', `/vpcs/${mockVpc.id}`);
    cy.wait('@getSubnets');

    // Confirm that new VPC information is displayed on details page as expected.
    cy.findByText(mockVpc.label).should('be.visible');
    cy.get('[data-qa-vpc-summary]')
      .should('be.visible')
      .within(() => {
        cy.contains(`Subnets ${mockVpc.subnets.length}`).should('be.visible');
        cy.contains(`Linodes ${totalSubnetUniqueLinodes}`).should('be.visible');
        cy.contains(`VPC ID ${mockVpc.id}`).should('be.visible');
        cy.contains(`Region ${mockVPCRegion.label}`).should('be.visible');
      });

    mockSubnets.forEach((mockSubnet: Subnet) => {
      cy.findByText(mockSubnet.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText(mockSubnet.id).should('be.visible');
          cy.findByText(mockSubnet.ipv4!).should('be.visible');
          cy.findByText(mockSubnet.linodes.length).should('be.visible');
        });
    });
  });

  /*
   * - Confirms VPC creation flow without creating subnets using mock API data.
   * - Confirms that users can delete the pre-existing subnet in the create form.
   * - Confirms that "Add another Subnet" button label updates to reflect no subnets.
   * - Confirms that Cloud Manager UI responds accordingly when creating a VPC without subnets.
   */
  it('can create a VPC without any subnets', () => {
    const mockVPCRegion = extendRegion(
      regionFactory.build({
        capabilities: ['VPCs'],
      })
    );

    const mockVpc: VPC = vpcFactory.build({
      id: randomNumber(10000, 99999),
      label: randomLabel(),
      region: mockVPCRegion.id,
      description: randomPhrase(),
      subnets: [],
    });

    const totalSubnetUniqueLinodes = getUniqueLinodesFromSubnets([]);

    mockGetRegions([mockVPCRegion]).as('getRegions');

    cy.visitWithLogin('/vpcs/create');
    cy.wait('@getRegions');

    ui.regionSelect.find().click().type(`${mockVPCRegion.label}{enter}`);

    cy.findByText('VPC Label').should('be.visible').click().type(mockVpc.label);

    // Remove the subnet.
    getSubnetNodeSection(0)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Remove Subnet 0')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm that subnet button label is "Add a Subnet" when there are no
    // subnets.
    mockCreateVPC(mockVpc).as('createVpc');
    mockGetSubnets(mockVpc.id, []).as('getSubnets');
    ui.button
      .findByTitle('Add a Subnet')
      .should('be.visible')
      .should('be.enabled');

    cy.findByText('Add another Subnet').should('not.exist');

    // Create the VPC and confirm the user is redirected to the details page.
    ui.button
      .findByTitle('Create VPC')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createVpc');
    cy.url().should('endWith', `/vpcs/${mockVpc.id}`);
    cy.wait('@getSubnets');

    // Confirm that the expected VPC information is shown, and that no Subnets
    // are listed in the table.
    cy.get('[data-qa-vpc-summary]')
      .should('be.visible')
      .within(() => {
        cy.contains(`Subnets ${mockVpc.subnets.length}`).should('be.visible');
        cy.contains(`Linodes ${totalSubnetUniqueLinodes}`).should('be.visible');
        cy.contains(`VPC ID ${mockVpc.id}`).should('be.visible');
        cy.contains(`Region ${mockVPCRegion.label}`).should('be.visible');
      });

    cy.findByText('No Subnets are assigned.').should('be.visible');
  });
});
