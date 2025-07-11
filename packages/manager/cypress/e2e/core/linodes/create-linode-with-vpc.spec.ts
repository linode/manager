import {
  linodeConfigInterfaceFactoryWithVPC,
  linodeFactory,
  regionFactory,
} from '@linode/utilities';
import {
  mockGetAccount,
  mockGetAccountSettings,
} from 'support/intercepts/account';
import { mockGetLinodeConfig } from 'support/intercepts/configs';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateLinode,
  mockGetLinodeDetails,
} from 'support/intercepts/linodes';
import { mockGetRegion, mockGetRegions } from 'support/intercepts/regions';
import {
  mockCreateVPC,
  mockCreateVPCError,
  mockGetSubnets,
  mockGetVPC,
  mockGetVPCs,
} from 'support/intercepts/vpc';
import { ui } from 'support/ui';
import { linodeCreatePage, vpcCreateDrawer } from 'support/ui/pages';
import { assertNewLinodeInterfacesIsAvailable } from 'support/util/linodes';
import {
  randomIp,
  randomLabel,
  randomNumber,
  randomPhrase,
  randomString,
} from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import {
  accountFactory,
  accountSettingsFactory,
  linodeConfigFactory,
  subnetFactory,
  vpcFactory,
} from 'src/factories';
import { WARNING_ICON_UNRECOMMENDED_CONFIG } from 'src/features/VPCs/constants';

import type { Region } from '@linode/api-v4';

describe('Create Linode with VPCs (Legacy)', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeInterfaces: { enabled: false },
    });
  });
  /*
   * - Confirms UI flow to create a Linode with an existing VPC assigned using mock API data.
   * - Confirms that VPC assignment is reflected in create summary section.
   * - Confirms that outgoing API request contains expected VPC interface data.
   * - Confirms newly assigned Linode does not have an unrecommended config notice inside VPC
   */
  it('can assign existing VPCs during Linode Create flow', () => {
    const linodeRegion = chooseRegion({ capabilities: ['VPCs'] });

    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      ipv4: `${randomIp()}/0`,
      label: randomLabel(),
      linodes: [],
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

    const mockUpdatedSubnet = {
      ...mockSubnet,
      linodes: [
        {
          id: mockLinode.id,
          interfaces: [
            {
              active: true,
              config_id: mockLinodeConfig.id,
              id: mockInterface.id,
            },
          ],
        },
      ],
    };

    mockGetVPCs([mockVPC]).as('getVPCs');
    mockGetVPC(mockVPC).as('getVPC');
    mockCreateLinode(mockLinode).as('createLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode);

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is not present.
    assertNewLinodeInterfacesIsAvailable(false);

    // Confirm that mocked VPC is shown in the Autocomplete, and then select it.
    cy.findByText('Assign VPC').click();
    cy.focused().type(mockVPC.label);

    ui.autocompletePopper
      .findByTitle(mockVPC.label)
      .should('be.visible')
      .click();

    // Confirm that VPC's subnet gets selected
    cy.findByLabelText('Subnet').should(
      'have.value',
      `${mockSubnet.label} (${mockSubnet.ipv4})`
    );

    // Confirm VPC assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      cy.findByText('VPC').should('be.visible');
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
      expect(expectedVpcInterface['ipv4']).to.deep.equal({});
      expect(expectedVpcInterface['subnet_id']).to.equal(mockSubnet.id);
      expect(expectedVpcInterface['purpose']).to.equal('vpc');
      // Confirm that VPC interfaces are always marked as the primary interface
      expect(expectedVpcInterface['primary']).to.equal(true);
    });

    // Confirm redirect to new Linode.
    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);

    // Confirm newly created Linode does not have unrecommended configuration notice
    mockGetVPC(mockVPC).as('getVPC');
    mockGetSubnets(mockVPC.id, [mockUpdatedSubnet]).as('getSubnets');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeConfig(mockLinode.id, mockLinodeConfig).as('getLinodeConfig');

    cy.visit(`/vpcs/${mockVPC.id}`);
    cy.findByLabelText(`expand ${mockSubnet.label} row`).click();
    cy.wait('@getLinodeConfig');
    cy.findByTestId(WARNING_ICON_UNRECOMMENDED_CONFIG).should('not.exist');
  });

  /*
   * - Confirms UI flow to create a Linode with a new VPC assigned using mock API data.
   * - Creates a VPC and a subnet from within the Linode Create flow.
   * - Confirms that Cloud responds gracefully when VPC create API request fails.
   * - Confirms that outgoing API request contains correct VPC interface data.
   * - Confirms newly assigned Linode does not have an unrecommended config notice inside VPC
   */
  it('can assign new VPCs during Linode Create flow', () => {
    const linodeRegion = chooseRegion({ capabilities: ['VPCs'] });

    const mockErrorMessage = 'An unknown error occurred.';

    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      ipv4: '10.0.0.0/24',
      label: randomLabel(),
      linodes: [],
    });

    const mockVPC = vpcFactory.build({
      description: randomPhrase(),
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
      subnets: [mockSubnet],
    });

    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
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

    const mockUpdatedSubnet = {
      ...mockSubnet,
      linodes: [
        {
          id: mockLinode.id,
          interfaces: [
            {
              active: true,
              config_id: mockLinodeConfig.id,
              id: mockInterface.id,
            },
          ],
        },
      ],
    };

    mockGetVPCs([]);
    mockCreateLinode(mockLinode).as('createLinode');
    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is not present.
    assertNewLinodeInterfacesIsAvailable(false);

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
        cy.findByText(mockErrorMessage).scrollIntoView();
        cy.findByText(mockErrorMessage).should('be.visible');

        // Create VPC with successful API response mocked.
        mockCreateVPC(mockVPC).as('createVpc');
        mockGetVPCs([mockVPC]);
        vpcCreateDrawer.submit();
      });

    // Verify the VPC field gets populated
    cy.findByLabelText('Assign VPC').should('have.value', mockVPC.label);

    // Verify the subnet gets populated
    cy.findByLabelText('Subnet').should(
      'have.value',
      `${mockSubnet.label} (${mockSubnet.ipv4})`
    );

    // Clear the subnet value
    cy.get('[data-qa-autocomplete="Subnet"]').within(() => {
      cy.findByLabelText('Clear').click();
    });

    // Try to submit the form without a subnet selected
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Verify a validation error shows
    cy.findByText('Subnet is required.').should('be.visible');

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
      // Confirm that VPC interfaces are always marked as the primary interface
      expect(expectedVpcInterface['primary']).to.equal(true);
    });

    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);

    // Confirm newly created Linode does not have unrecommended configuration notice
    mockGetVPC(mockVPC).as('getVPC');
    mockGetSubnets(mockVPC.id, [mockUpdatedSubnet]).as('getSubnets');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeConfig(mockLinode.id, mockLinodeConfig).as('getLinodeConfig');

    cy.visit(`/vpcs/${mockVPC.id}`);
    cy.findByLabelText(`expand ${mockSubnet.label} row`).click();
    cy.wait('@getLinodeConfig');
    cy.findByTestId(WARNING_ICON_UNRECOMMENDED_CONFIG).should('not.exist');
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

    // Confirm the Linode Interfaces section is not present.
    assertNewLinodeInterfacesIsAvailable(false);

    cy.findByLabelText('Assign VPC').scrollIntoView();
    cy.findByLabelText('Assign VPC').should('be.visible').should('be.disabled');

    cy.findByText(vpcNotAvailableMessage).should('be.visible');
  });
});

describe('Create Linode with VPCs (Linode Interfaces)', () => {
  const linodeRegion: Region = regionFactory.build({
    id: 'us-east',
    label: 'Newark, NJ',
    capabilities: ['Linodes', 'Linode Interfaces', 'VPCs'],
  });

  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeInterfaces: { enabled: true },
    });
    mockGetAccount(
      accountFactory.build({
        email: 'sdet@akamai.com',
        capabilities: ['Linodes', 'Linode Interfaces', 'Vlans'],
      })
    );
    mockGetAccountSettings(
      accountSettingsFactory.build({
        interfaces_for_new_linodes: 'legacy_config_default_but_linode_allowed',
      })
    );
    mockGetRegions([linodeRegion]);
    mockGetRegion(linodeRegion);
  });

  /*
   * Legacy Configuration Profile Interfaces
   * - Confirms UI flow to create a Linode with an existing VPC assigned using mock API data.
   * - Confirms that VPC assignment is reflected in create summary section.
   * - Confirms that outgoing API request contains expected VPC interface data.
   * - Confirms newly assigned Linode does not have an unrecommended config notice inside VPC
   */
  it('can assign existing VPCs during Linode Create flow (legacy)', () => {
    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      ipv4: `${randomIp()}/0`,
      label: randomLabel(),
      linodes: [],
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

    const mockUpdatedSubnet = {
      ...mockSubnet,
      linodes: [
        {
          id: mockLinode.id,
          interfaces: [
            {
              active: true,
              config_id: mockLinodeConfig.id,
              id: mockInterface.id,
            },
          ],
        },
      ],
    };

    mockGetVPCs([mockVPC]).as('getVPCs');
    mockGetVPC(mockVPC).as('getVPC');
    mockCreateLinode(mockLinode).as('createLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode);

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Select VPC card
    linodeCreatePage.selectInterfaceCard('VPC');

    // Confirm that mocked VPC is shown in the Autocomplete, and then select it.
    cy.get('[data-qa-autocomplete="VPC"]').within(() => {
      cy.findByLabelText('VPC').should('be.visible');
      cy.get('[data-testid="textfield-input"]').click();
      cy.focused().type(`${mockVPC.label}`);
    });

    ui.autocompletePopper
      .findByTitle(mockVPC.label)
      .should('be.visible')
      .click();

    // Confirm that VPC's subnet gets selected
    cy.findByLabelText('Subnet').should(
      'have.value',
      `${mockSubnet.label} (${mockSubnet.ipv4})`
    );

    // Confirm VPC assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      cy.findByText('VPC').should('be.visible');
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
      expect(expectedVpcInterface['ipv4']).to.deep.equal({
        nat_1_1: null,
        vpc: null,
      });
      expect(expectedVpcInterface['subnet_id']).to.equal(mockSubnet.id);
      expect(expectedVpcInterface['purpose']).to.equal('vpc');
    });

    // Confirm redirect to new Linode.
    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);

    // Confirm newly created Linode does not have unrecommended configuration notice
    mockGetVPC(mockVPC).as('getVPC');
    mockGetSubnets(mockVPC.id, [mockUpdatedSubnet]).as('getSubnets');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeConfig(mockLinode.id, mockLinodeConfig).as('getLinodeConfig');

    cy.visit(`/vpcs/${mockVPC.id}`);
    cy.findByLabelText(`expand ${mockSubnet.label} row`).click();
    cy.wait('@getLinodeConfig');
    cy.findByTestId(WARNING_ICON_UNRECOMMENDED_CONFIG).should('not.exist');
  });

  /*
   * Linode Interfaces
   * - Confirms UI flow to create a Linode with an existing VPC assigned using mock API data.
   * - Confirms that VPC assignment is reflected in create summary section.
   * - Confirms that outgoing API request contains expected VPC interface data.
   * - Confirms newly assigned Linode does not have an unrecommended config notice inside VPC
   */
  it('can assign existing VPCs during Linode Create flow (Linode Inteface)', () => {
    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      ipv4: `${randomIp()}/0`,
      label: randomLabel(),
      linodes: [],
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

    const mockUpdatedSubnet = {
      ...mockSubnet,
      linodes: [
        {
          id: mockLinode.id,
          interfaces: [
            {
              active: true,
              config_id: mockLinodeConfig.id,
              id: mockInterface.id,
            },
          ],
        },
      ],
    };

    mockGetVPCs([mockVPC]).as('getVPCs');
    mockGetVPC(mockVPC).as('getVPC');
    mockCreateLinode(mockLinode).as('createLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode);

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Switch to Linode Interfaces
    linodeCreatePage.selectLinodeInterfacesType();

    // Select VPC card
    linodeCreatePage.selectInterfaceCard('VPC');

    // Confirm that mocked VPC is shown in the Autocomplete, and then select it.
    cy.get('[data-qa-autocomplete="VPC"]').within(() => {
      cy.findByLabelText('VPC').should('be.visible');
      cy.get('[data-testid="textfield-input"]').click();
      cy.focused().type(`${mockVPC.label}`);
    });

    ui.autocompletePopper
      .findByTitle(mockVPC.label)
      .should('be.visible')
      .click();

    // Confirm that VPC's subnet gets selected
    cy.findByLabelText('Subnet').should(
      'have.value',
      `${mockSubnet.label} (${mockSubnet.ipv4})`
    );

    // Confirm VPC assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      cy.findByText('VPC').should('be.visible');
    });

    // Create Linode and confirm contents of outgoing API request payload.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const expectedVpcInterface = requestPayload['interfaces'][0]['vpc'];

      console.log(`requestPayload: ${JSON.stringify(requestPayload)}`);

      // Confirm that request payload includes VPC interface.
      expect(expectedVpcInterface).to.not.deep.equal({});
      expect(expectedVpcInterface['ipv4']).to.not.deep.equal({});
      expect(expectedVpcInterface['subnet_id']).to.equal(mockSubnet.id);
    });

    // Confirm redirect to new Linode.
    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);

    // Confirm newly created Linode does not have unrecommended configuration notice
    mockGetVPC(mockVPC).as('getVPC');
    mockGetSubnets(mockVPC.id, [mockUpdatedSubnet]).as('getSubnets');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeConfig(mockLinode.id, mockLinodeConfig).as('getLinodeConfig');

    cy.visit(`/vpcs/${mockVPC.id}`);
    cy.findByLabelText(`expand ${mockSubnet.label} row`).click();
    cy.wait('@getLinodeConfig');
    cy.findByTestId(WARNING_ICON_UNRECOMMENDED_CONFIG).should('not.exist');
  });

  /*
   * Legacy Configuration Profile Interfaces
   * - Confirms UI flow to create a Linode with a new VPC assigned using mock API data.
   * - Creates a VPC and a subnet from within the Linode Create flow.
   * - Confirms that Cloud responds gracefully when VPC create API request fails.
   * - Confirms that outgoing API request contains correct VPC interface data.
   * - Confirms newly assigned Linode does not have an unrecommended config notice inside VPC
   */
  it('can assign new VPCs during Linode Create flow (legacy)', () => {
    const mockErrorMessage = 'An unknown error occurred.';

    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      ipv4: '10.0.0.0/24',
      label: randomLabel(),
      linodes: [],
    });

    const mockVPC = vpcFactory.build({
      description: randomPhrase(),
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
      subnets: [mockSubnet],
    });

    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
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

    const mockUpdatedSubnet = {
      ...mockSubnet,
      linodes: [
        {
          id: mockLinode.id,
          interfaces: [
            {
              active: true,
              config_id: mockLinodeConfig.id,
              id: mockInterface.id,
            },
          ],
        },
      ],
    };

    mockGetVPCs([]);
    mockCreateLinode(mockLinode).as('createLinode');
    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Select VPC card
    linodeCreatePage.selectInterfaceCard('VPC');

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
        cy.findByText(mockErrorMessage).scrollIntoView();
        cy.findByText(mockErrorMessage).should('be.visible');

        // Create VPC with successful API response mocked.
        mockCreateVPC(mockVPC).as('createVpc');
        mockGetVPCs([mockVPC]);
        vpcCreateDrawer.submit();
      });

    // Verify the VPC field gets populated
    cy.get('[data-qa-autocomplete="VPC"]').within(() => {
      cy.findByLabelText('VPC').should('be.visible');
      cy.get('[data-testid="textfield-input"]').click();
      cy.focused().type(`${mockVPC.label}`);
    });

    ui.autocompletePopper
      .findByTitle(mockVPC.label)
      .should('be.visible')
      .click();

    // Verify the subnet gets populated
    cy.findByLabelText('Subnet').should(
      'have.value',
      `${mockSubnet.label} (${mockSubnet.ipv4})`
    );

    // Clear the subnet value
    cy.get('[data-qa-autocomplete="Subnet"]').within(() => {
      cy.findByLabelText('Clear').click();
    });

    // Try to submit the form without a subnet selected
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Verify a validation error shows
    cy.findByText('Subnet is required.').should('be.visible');

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
      expect(expectedVpcInterface['ipv4']).to.deep.equal({
        nat_1_1: 'any',
        vpc: null,
      });
      expect(expectedVpcInterface['subnet_id']).to.equal(mockSubnet.id);
      expect(expectedVpcInterface['purpose']).to.equal('vpc');
    });

    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);

    // Confirm newly created Linode does not have unrecommended configuration notice
    mockGetVPC(mockVPC).as('getVPC');
    mockGetSubnets(mockVPC.id, [mockUpdatedSubnet]).as('getSubnets');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeConfig(mockLinode.id, mockLinodeConfig).as('getLinodeConfig');

    cy.visit(`/vpcs/${mockVPC.id}`);
    cy.findByLabelText(`expand ${mockSubnet.label} row`).click();
    cy.wait('@getLinodeConfig');
    cy.findByTestId(WARNING_ICON_UNRECOMMENDED_CONFIG).should('not.exist');
  });

  /*
   * Linode Interfaces
   * - Confirms UI flow to create a Linode with a new VPC assigned using mock API data.
   * - Creates a VPC and a subnet from within the Linode Create flow.
   * - Confirms that Cloud responds gracefully when VPC create API request fails.
   * - Confirms that outgoing API request contains correct VPC interface data.
   * - Confirms newly assigned Linode does not have an unrecommended config notice inside VPC
   */
  it('can assign new VPCs during Linode Create flow (Linode Interface)', () => {
    const mockErrorMessage = 'An unknown error occurred.';

    const mockSubnet = subnetFactory.build({
      id: randomNumber(),
      ipv4: '10.0.0.0/24',
      label: randomLabel(),
      linodes: [],
    });

    const mockVPC = vpcFactory.build({
      description: randomPhrase(),
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
      subnets: [mockSubnet],
    });

    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
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

    const mockUpdatedSubnet = {
      ...mockSubnet,
      linodes: [
        {
          id: mockLinode.id,
          interfaces: [
            {
              active: true,
              config_id: mockLinodeConfig.id,
              id: mockInterface.id,
            },
          ],
        },
      ],
    };

    mockGetVPCs([]);
    mockCreateLinode(mockLinode).as('createLinode');
    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Switch to Linode Interfaces
    linodeCreatePage.selectLinodeInterfacesType();

    // Select VPC card
    linodeCreatePage.selectInterfaceCard('VPC');

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
        cy.findByText(mockErrorMessage).scrollIntoView();
        cy.findByText(mockErrorMessage).should('be.visible');

        // Create VPC with successful API response mocked.
        mockCreateVPC(mockVPC).as('createVpc');
        mockGetVPCs([mockVPC]);
        vpcCreateDrawer.submit();
      });

    // Verify the VPC field gets populated
    cy.get('[data-qa-autocomplete="VPC"]').within(() => {
      cy.findByLabelText('VPC').should('be.visible');
      cy.get('[data-testid="textfield-input"]').click();
    });

    ui.autocompletePopper
      .findByTitle(mockVPC.label)
      .should('be.visible')
      .click();

    // Verify the subnet gets populated
    cy.findByLabelText('Subnet').should(
      'have.value',
      `${mockSubnet.label} (${mockSubnet.ipv4})`
    );

    // Clear the subnet value
    cy.get('[data-qa-autocomplete="Subnet"]').within(() => {
      cy.findByLabelText('Clear').click();
    });

    // Try to submit the form without a subnet selected
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Verify a validation error shows
    cy.findByText('Subnet is required.').should('be.visible');

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
      const expectedVpcInterface = requestPayload['interfaces'][0]['vpc'];

      // Confirm that request payload includes VPC interface.
      expect(expectedVpcInterface).to.not.equal(null);
      expect(expectedVpcInterface['ipv4']).to.not.equal({});
      expect(expectedVpcInterface['ipv4']['addresses'][0]).to.deep.equal({
        address: 'auto',
        nat_1_1_address: 'auto',
      });
      expect(expectedVpcInterface['subnet_id']).to.equal(mockSubnet.id);
    });

    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);

    // Confirm newly created Linode does not have unrecommended configuration notice
    mockGetVPC(mockVPC).as('getVPC');
    mockGetSubnets(mockVPC.id, [mockUpdatedSubnet]).as('getSubnets');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeConfig(mockLinode.id, mockLinodeConfig).as('getLinodeConfig');

    cy.visit(`/vpcs/${mockVPC.id}`);
    cy.findByLabelText(`expand ${mockSubnet.label} row`).click();
    cy.wait('@getLinodeConfig');
    cy.findByTestId(WARNING_ICON_UNRECOMMENDED_CONFIG).should('not.exist');
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

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Select VPC card.
    linodeCreatePage.selectInterfaceCard('VPC');

    // Confirm that VPC selection is disabled.
    cy.get('[data-qa-autocomplete="VPC"]').within(() => {
      cy.findByLabelText('VPC').should('be.visible');
      cy.get('[data-testid="textfield-input"]')
        .should('be.visible')
        .should('be.disabled');
    });

    // Confirm that VPC's subnet selection is disabled.
    cy.findByLabelText('Subnet').should('be.visible').should('be.disabled');

    cy.findByText(vpcNotAvailableMessage).should('be.visible');
  });
});
