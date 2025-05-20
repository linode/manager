import { linodeFactory, regionFactory } from '@linode/utilities';
import { grantsFactory, profileFactory } from '@linode/utilities';
import { subnetFactory, vpcFactory } from '@src/factories';
import { mockGetUser } from 'support/intercepts/account';
/**
 * @file Integration tests for VPC create flow.
 */
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import {
  mockCreateVPC,
  mockCreateVPCError,
  mockGetSubnets,
} from 'support/intercepts/vpc';
import { ui } from 'support/ui';
import { buildArray } from 'support/util/arrays';
import {
  randomIp,
  randomLabel,
  randomNumber,
  randomPhrase,
  randomString,
} from 'support/util/random';
import { extendRegion } from 'support/util/regions';

import { accountUserFactory } from 'src/factories';
import { getUniqueResourcesFromSubnets } from 'src/features/VPCs/utils';

import type { Subnet, VPC } from '@linode/api-v4';

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
        id: randomNumber(10000, 99999),
        ipv4: `${randomIp()}/${randomNumber(0, 32)}`,
        label: randomLabel(),
        linodes: linodeFactory.buildList(index + 1),
      });
    });

    const mockSubnetToDelete: Subnet = subnetFactory.build();
    const mockInvalidIpRange = `${randomIp()}/${randomNumber(33, 100)}`;

    const mockVpc: VPC = vpcFactory.build({
      description: randomPhrase(),
      id: randomNumber(10000, 99999),
      label: randomLabel(),
      region: mockVPCRegion.id,
      subnets: mockSubnets,
    });

    const ipValidationErrorMessage1 = 'A subnet must have an IPv4 range.';
    const ipValidationErrorMessage2 = 'The IPv4 range must be in CIDR format.';
    const vpcCreationErrorMessage = 'An unknown error has occurred.';
    const totalSubnetUniqueLinodes = getUniqueResourcesFromSubnets(mockSubnets);

    mockGetRegions([mockVPCRegion]).as('getRegions');

    cy.visitWithLogin('/vpcs/create');
    cy.wait('@getRegions');

    ui.regionSelect.find().click();
    cy.focused().type(`${mockVPCRegion.label}{enter}`);

    cy.findByText('VPC Label').should('be.visible').click();
    cy.focused().type(mockVpc.label);

    cy.findByText('Description').should('be.visible').click();
    cy.focused().type(mockVpc.description);

    // Fill out the first Subnet.
    // Insert an invalid empty IP range to confirm client side validation.
    getSubnetNodeSection(0)
      .should('be.visible')
      .within(() => {
        cy.findByText('Subnet Label').should('be.visible').click();
        cy.focused().type(mockSubnets[0].label);

        cy.findByText('Subnet IP Address Range').should('be.visible').click();
        cy.focused().type(`{selectAll}{backspace}`);
      });

    ui.button
      .findByTitle('Create VPC')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.findByText(ipValidationErrorMessage1).should('be.visible');

    // Enter a random non-IP address string to further test client side validation.
    cy.findByText('Subnet IP Address Range').should('be.visible').click();
    cy.focused().type(`{selectAll}{backspace}`);
    cy.focused().type(randomString(18));

    ui.button
      .findByTitle('Create VPC')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.findByText(ipValidationErrorMessage2).should('be.visible');

    // Enter a valid IP address with an invalid network prefix to further test client side validation.
    cy.findByText('Subnet IP Address Range').should('be.visible').click();
    cy.focused().type(`{selectAll}{backspace}`);
    cy.focused().type(mockInvalidIpRange);

    ui.button
      .findByTitle('Create VPC')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.findByText(ipValidationErrorMessage2).should('be.visible');

    // Replace invalid IP address range with valid range.
    cy.findByText('Subnet IP Address Range').should('be.visible').click();
    cy.focused().type(`{selectAll}{backspace}`);
    cy.focused().type(mockSubnets[0].ipv4!);

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
        cy.findByText('Subnet IP Address Range').should('be.visible').click();
        cy.focused().type(`{selectAll}{backspace}`);
        cy.focused().type(mockSubnetToDelete.ipv4!);
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
          cy.findByText('Subnet Label').should('be.visible').click();
          cy.focused().type(mockSubnet.label);

          cy.findByText('Subnet IP Address Range').should('be.visible').click();
          cy.focused().type(`{selectAll}{backspace}`);
          cy.focused().type(`${randomIp()}/${randomNumber(0, 32)}`);
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
        cy.contains(`Resources ${totalSubnetUniqueLinodes}`).should(
          'be.visible'
        );
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
      description: randomPhrase(),
      id: randomNumber(10000, 99999),
      label: randomLabel(),
      region: mockVPCRegion.id,
      subnets: [],
    });

    const totalSubnetUniqueLinodes = getUniqueResourcesFromSubnets([]);

    mockGetRegions([mockVPCRegion]).as('getRegions');

    cy.visitWithLogin('/vpcs/create');
    cy.wait('@getRegions');

    ui.regionSelect.find().click().type(`${mockVPCRegion.label}{enter}`);

    cy.findByText('VPC Label').should('be.visible').click();
    cy.focused().type(mockVpc.label);

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
        cy.contains(`Resources ${totalSubnetUniqueLinodes}`).should(
          'be.visible'
        );
        cy.contains(`VPC ID ${mockVpc.id}`).should('be.visible');
        cy.contains(`Region ${mockVPCRegion.label}`).should('be.visible');
      });

    cy.findByText('No Subnets are assigned.').should('be.visible');
  });
});

describe('restricted user cannot create vpc', () => {
  beforeEach(() => {
    const mockProfile = profileFactory.build({
      restricted: true,
      username: randomLabel(),
    });

    const mockUser = accountUserFactory.build({
      restricted: true,
      user_type: 'default',
      username: mockProfile.username,
    });

    const mockGrants = grantsFactory.build({
      global: {
        add_vpcs: false,
      },
    });

    mockGetProfile(mockProfile);
    mockGetProfileGrants(mockGrants);
    mockGetUser(mockUser);
  });

  /*
   * - Verifies that restricted user cannot create vpc on landing page
   */
  it('create vpc is disabled on landing page', () => {
    cy.visitWithLogin('/vpcs');
    ui.button
      .findByTitle('Create VPC')
      .should('be.visible')
      .should('be.disabled');
  });

  /*
   * - Verifies that restricted user cannot create vpc in Create page
   */
  it('create vpc create page is disabled', () => {
    cy.visitWithLogin('/vpcs/create');
    cy.findByText(
      "You don't have permissions to create a new VPC. Please contact an account administrator for details."
    );
    cy.get('[data-testid="formVpcCreate"]').within(() => {
      ui.buttonGroup
        .findButtonByTitle('Create VPC')
        .should('be.visible')
        .should('be.disabled');
      // all form inputs are disabled
      cy.get('input').each((input) => {
        cy.wrap(input).should('be.disabled');
      });
    });
  });
});
