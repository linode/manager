import {
  linodeFactory,
  regionFactory,
  subnetFactory,
  vpcFactory,
} from 'src/factories';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import {
  mockCreateLinode,
  mockGetLinodeDetails,
} from 'support/intercepts/linodes';
import { mockGetRegions } from 'support/intercepts/regions';
import {
  mockCreateVPC,
  mockCreateVPCError,
  mockGetVPC,
  mockGetVPCs,
} from 'support/intercepts/vpc';
import { ui } from 'support/ui';
import { linodeCreatePage, vpcCreateDrawer } from 'support/ui/pages';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import {
  randomIp,
  randomLabel,
  randomNumber,
  randomPhrase,
  randomString,
} from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

describe('Create Linode with VPCs', () => {
  // TODO Remove feature flag mocks when `linodeCreateRefactor` flag is retired.
  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeCreateRefactor: makeFeatureFlagData(true),
    });
    mockGetFeatureFlagClientstream();
  });

  /*
   * - Confirms UI flow to create a Linode with an existing VPC assigned using mock API data.
   * - Confirms that VPC assignment is reflected in create summary section.
   * - Confirms that outgoing API request contains expected VPC interface data.
   */
  it('can assign existing VPCs during Linode Create flow', () => {
    const linodeRegion = chooseRegion({ capabilities: ['VPCs'] });

    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      linodes: [],
      ipv4: `${randomIp()}/0`,
    });

    const mockVPC = vpcFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
      subnets: [mockSubnet],
    });

    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
      //
    });

    mockGetVPCs([mockVPC]).as('getVPCs');
    mockGetVPC(mockVPC).as('getVPC');
    mockCreateLinode(mockLinode).as('createLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode);

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 11');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm that mocked VPC is shown in the Autocomplete, and then select it.
    cy.findByText('Assign VPC').click().type(`${mockVPC.label}`);

    ui.autocompletePopper
      .findByTitle(mockVPC.label)
      .should('be.visible')
      .click();

    // Confirm that Subnet selection appears and select mock subnet.
    cy.findByLabelText('Subnet').should('be.visible').type(mockSubnet.label);

    ui.autocompletePopper
      .findByTitle(`${mockSubnet.label} (${mockSubnet.ipv4})`)
      .should('be.visible')
      .click();

    // Confirm VPC assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]')
      .scrollIntoView()
      .within(() => {
        cy.findByText('VPC Assigned').should('be.visible');
      });

    // Create Linode and confirm contents of outgoing API request payload.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const expectedVpcInterface = requestPayload['interfaces'][0];

      // Confirm that request payload includes VPC interface.
      expect(expectedVpcInterface['vpc_id']).to.equal(mockVPC.id);
      expect(expectedVpcInterface['ipv4']).to.be.an('object').that.is.empty;
      expect(expectedVpcInterface['subnet_id']).to.equal(mockSubnet.id);
      expect(expectedVpcInterface['purpose']).to.equal('vpc');
    });

    // Confirm redirect to new Linode.
    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // TODO Confirm whether toast notification should appear on Linode create.
  });

  /*
   * - Confirms UI flow to create a Linode with a new VPC assigned using mock API data.
   * - Creates a VPC and a subnet from within the Linode Create flow.
   * - Confirms that Cloud responds gracefully when VPC create API request fails.
   * - Confirms that outgoing API request contains correct VPC interface data.
   */
  it('can assign new VPCs during Linode Create flow', () => {
    const linodeRegion = chooseRegion({ capabilities: ['VPCs'] });

    const mockErrorMessage = 'An unknown error occurred.';

    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      linodes: [],
      ipv4: '10.0.0.0/24',
    });

    const mockVPC = vpcFactory.build({
      id: randomNumber(),
      description: randomPhrase(),
      label: randomLabel(),
      region: linodeRegion.id,
      subnets: [mockSubnet],
    });

    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
    });

    mockGetVPCs([]);
    mockCreateLinode(mockLinode).as('createLinode');
    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 11');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    cy.findByText('Create VPC').should('be.visible').click();

    ui.drawer
      .findByTitle('Create VPC')
      .should('be.visible')
      .within(() => {
        vpcCreateDrawer.setLabel(mockVPC.label);
        vpcCreateDrawer.setDescription(mockVPC.description);
        vpcCreateDrawer.setSubnetLabel(mockSubnet.label);
        vpcCreateDrawer.setSubnetIpRange(mockSubnet.ipv4!);

        // Confirm that unexpected API errors are handled gracefully upon
        // failed VPC creation.
        mockCreateVPCError(mockErrorMessage, 500).as('createVpc');
        vpcCreateDrawer.submit();

        cy.wait('@createVpc');
        cy.findByText(mockErrorMessage).scrollIntoView().should('be.visible');

        // Create VPC with successful API response mocked.
        mockCreateVPC(mockVPC).as('createVpc');
        vpcCreateDrawer.submit();
      });

    // Attempt to create Linode before selecting a VPC subnet, and confirm
    // that validation error appears.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.findByText('Subnet is required.').should('be.visible');

    // Confirm that Subnet selection appears and select mock subnet.
    cy.findByLabelText('Subnet').should('be.visible').type(mockSubnet.label);

    ui.autocompletePopper
      .findByTitle(`${mockSubnet.label} (${mockSubnet.ipv4})`)
      .should('be.visible')
      .click();

    // Check box to assign public IPv4.
    cy.findByText('Assign a public IPv4 address for this Linode')
      .should('be.visible')
      .click();

    // Create Linode and confirm contents of outgoing API request payload.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const expectedVpcInterface = requestPayload['interfaces'][0];

      // Confirm that request payload includes VPC interface.
      expect(expectedVpcInterface['vpc_id']).to.equal(mockVPC.id);
      expect(expectedVpcInterface['ipv4']).to.deep.equal({ nat_1_1: 'any' });
      expect(expectedVpcInterface['subnet_id']).to.equal(mockSubnet.id);
      expect(expectedVpcInterface['purpose']).to.equal('vpc');
    });

    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // TODO Confirm whether toast notification should appear on Linode create.
  });

  /*
   * - Confirms UI flow when attempting to assign VPC to Linode in region without capability.
   * - Confirms that VPCs selection is disabled.
   * - Confirms that notice text is present to explain that VPCs are unavailable.
   */
  it('cannot assign VPCs to Linodes in regions without VPC capability', () => {
    const mockRegion = regionFactory.build({
      capabilities: ['Linodes'],
    });

    const vpcNotAvailableMessage =
      'VPC is not available in the selected region.';

    mockGetRegions([mockRegion]);
    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.selectRegionById(mockRegion.id);

    cy.findByLabelText('Assign VPC')
      .scrollIntoView()
      .should('be.visible')
      .should('be.disabled');

    cy.findByText(vpcNotAvailableMessage).should('be.visible');
  });
});
