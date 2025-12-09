import { linodeFactory, nodeBalancerFactory } from '@linode/utilities';
import { authenticate } from 'support/api/authentication';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodes } from 'support/intercepts/linodes';
import {
  mockCreateNodeBalancer,
  mockGetNodeBalancer,
} from 'support/intercepts/nodebalancers';
import { mockGetVPC, mockGetVPCIPs, mockGetVPCs } from 'support/intercepts/vpc';
import { ui } from 'support/ui';
import { randomIp, randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { subnetFactory, vpcFactory, vpcIPv4Factory } from 'src/factories';

authenticate();
describe('Create a NodeBalancer with VPCs', () => {
  /*
   * - Confirms UI flow to create a Nodebalancer with an existing VPC assigned using mock API data.
   * - Confirms that VPC assignment is reflected in create summary section.
   * - Confirms that outgoing API request contains expected VPC interface data.
   */
  it('creates a NodeBalancer with a VPC', () => {
    const region = chooseRegion({
      capabilities: ['VPCs', 'NodeBalancers'],
    });

    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: region.id,
    });

    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      ipv4: `10.0.0.0/24`,
      label: randomLabel(),
      linodes: [
        {
          id: mockLinode.id,
          interfaces: [],
        },
      ],
    });

    const mockVPC = vpcFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: region.id,
      subnets: [mockSubnet],
    });

    const mockLinodeVPCIPv4 = vpcIPv4Factory.build({
      address: '10.0.0.2',
      vpc_id: mockVPC.id,
      subnet_id: mockSubnet.id,
      region: region.id,
      linode_id: mockLinode.id,
    });

    const mockNodeBalancer = nodeBalancerFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: region.id,
      ipv4: randomIp(),
    });

    mockAppendFeatureFlags({
      nodebalancerVpc: true,
    }).as('getFeatureFlags');

    mockGetVPCs([mockVPC]).as('getVPCs');
    mockGetVPC(mockVPC).as('getVPC');
    mockGetLinodes([mockLinode]).as('getLinodes');
    mockCreateNodeBalancer(mockNodeBalancer).as('createNodeBalancer');
    mockGetNodeBalancer(mockNodeBalancer);
    mockGetVPCIPs(mockVPC.id, [mockLinodeVPCIPv4]).as('getVPCIPs');

    cy.visitWithLogin('/nodebalancers/create');
    cy.wait('@getFeatureFlags');

    cy.get('[id="nodebalancer-label"]').should('be.visible').click();
    cy.focused().clear();
    cy.focused().type(mockNodeBalancer.label);

    // this will create the NB in newark, where the default Linode was created
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionLabel(region.label).click();

    // Confirm that mocked VPC is shown in the Autocomplete, and then select it.
    cy.get('[data-testid="vpc-select"]').click();
    cy.focused().type(mockVPC.label);

    ui.autocompletePopper
      .findByTitle(mockVPC.label)
      .should('be.visible')
      .click();

    // The "Node IP Address Select" should fetch the selected VPC and its IPs to render options.
    cy.wait(['@getVPC', '@getVPCIPs']);

    // Confirm that VPC's subnet gets selected
    cy.findByLabelText('Subnet').should(
      'have.value',
      `${mockSubnet.label} (${mockSubnet.ipv4})`
    );

    // Uncheck the option for auto-assigning VPC IPv4 range
    cy.get('[data-testid="vpc-ipv4-checkbox"]')
      .find('[type="checkbox"]')
      .should('be.checked')
      .click();

    cy.findByText(`NodeBalancer IPv4 CIDR for ${mockSubnet.label}`).click();
    cy.focused().clear();
    cy.focused().type('10.0.0.4/30');
    // node backend config
    cy.findByText('Label').click();
    cy.focused().type(randomLabel());
    cy.findByLabelText('IP Address').should('be.visible').click();
    cy.focused().type('10.0.0.2');
    ui.autocompletePopper.findByTitle('10.0.0.2').should('be.visible').click();
    cy.findByLabelText('Weight').should('be.visible').click();
    cy.focused().clear();
    cy.focused().type('100');

    cy.get('[data-qa-summary="true"]').within(() => {
      cy.contains(`Nodes 1`).should('be.visible');
    });

    cy.get('[data-qa-deploy-nodebalancer]').click();
    cy.wait('@createNodeBalancer').its('response.statusCode').should('eq', 200);
  });
});
