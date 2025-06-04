import { linodeFactory, regionFactory } from '@linode/utilities';
import {
  mockGetAccount,
  mockGetAccountSettings,
} from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockCreateLinode } from 'support/intercepts/linodes';
import { mockGetRegion, mockGetRegions } from 'support/intercepts/regions';
import { mockGetVLANs } from 'support/intercepts/vlans';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { assertNewLinodeInterfacesIsAvailable } from 'support/util/linodes';
import {
  randomIp,
  randomLabel,
  randomNumber,
  randomString,
} from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import {
  accountFactory,
  accountSettingsFactory,
  VLANFactory,
} from 'src/factories';

import type { Region } from '@linode/api-v4';

describe('Create Linode with VLANs (Legacy)', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeInterfaces: { enabled: false },
    });
  });

  /*
   * - Uses mock API data to confirm VLAN attachment UI flow during Linode create.
   * - Confirms that outgoing Linode create API request contains expected data for VLAN.
   * - Confirms that attached VLAN is reflected in the Linode create summary.
   */
  it('can assign existing VLANs during Linode create flow', () => {
    const mockLinodeRegion = chooseRegion({
      capabilities: ['Linodes', 'Vlans'],
    });
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
    });

    const mockVlan = VLANFactory.build({
      cidr_block: `${randomIp()}/24`,
      id: randomNumber(),
      label: randomLabel(),
      linodes: [],
      region: mockLinodeRegion.id,
    });

    mockGetVLANs([mockVlan]);
    mockCreateLinode(mockLinode).as('createLinode');
    cy.visitWithLogin('/linodes/create');

    // Fill out necessary Linode create fields.
    linodeCreatePage.selectRegionById(mockLinodeRegion.id);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is not present.
    assertNewLinodeInterfacesIsAvailable(false);

    // Open VLAN accordion and select existing VLAN.
    ui.accordionHeading.findByTitle('VLAN').click();
    ui.accordion
      .findByTitle('VLAN')
      .scrollIntoView()
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('VLAN').should('be.enabled').type(mockVlan.label);

        ui.autocompletePopper
          .findByTitle(mockVlan.label)
          .should('be.visible')
          .click();

        cy.findByLabelText(/IPAM Address/)
          .should('be.enabled')
          .type(mockVlan.cidr_block);
      });

    // Confirm that VLAN attachment is listed in summary, then create Linode.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      cy.findByText('VLAN Attached').should('be.visible');
    });

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm outgoing API request payload has expected data.
    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const expectedPublicInterface = requestPayload['interfaces'][0];
      const expectedVlanInterface = requestPayload['interfaces'][1];

      // Confirm that first interface is for public internet.
      expect(expectedPublicInterface['purpose']).to.equal('public');

      // Confirm that second interface is our chosen VLAN.
      expect(expectedVlanInterface['purpose']).to.equal('vlan');
      expect(expectedVlanInterface['label']).to.equal(mockVlan.label);
      expect(expectedVlanInterface['ipam_address']).to.equal(
        mockVlan.cidr_block
      );
    });

    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
  });

  /*
   * - Uses mock API data to confirm VLAN creation and attachment UI flow during Linode create.
   * - Confirms that outgoing Linode create API request contains expected data for new VLAN.
   * - Confirms that attached VLAN is reflected in the Linode create summary.
   */
  it('can assign new VLANs during Linode create flow', () => {
    const mockLinodeRegion = chooseRegion({
      capabilities: ['Linodes', 'Vlans'],
    });
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
    });

    const mockVlan = VLANFactory.build({
      cidr_block: `${randomIp()}/24`,
      id: randomNumber(),
      label: randomLabel(),
      linodes: [],
      region: mockLinodeRegion.id,
    });

    mockGetVLANs([]);
    mockCreateLinode(mockLinode).as('createLinode');
    cy.visitWithLogin('/linodes/create');

    // Fill out necessary Linode create fields.
    linodeCreatePage.selectRegionById(mockLinodeRegion.id);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is not present.
    assertNewLinodeInterfacesIsAvailable(false);

    // Open VLAN accordion and specify new VLAN.
    ui.accordionHeading.findByTitle('VLAN').click();
    ui.accordion
      .findByTitle('VLAN')
      .scrollIntoView()
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('VLAN').should('be.enabled').type(mockVlan.label);

        ui.autocompletePopper
          .findByTitle(`Create "${mockVlan.label}"`)
          .should('be.visible')
          .click();
      });

    // Confirm that VLAN attachment is listed in summary, then create Linode.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      cy.findByText('VLAN Attached').should('be.visible');
    });

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm outgoing API request payload has expected data.
    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const expectedPublicInterface = requestPayload['interfaces'][0];
      const expectedVlanInterface = requestPayload['interfaces'][1];

      console.log(`requestPayload: ${requestPayload}`);

      // Confirm that first interface is for public internet.
      expect(expectedPublicInterface['purpose']).to.equal('public');

      // Confirm that second interface is our chosen VLAN.
      expect(expectedVlanInterface['purpose']).to.equal('vlan');
      expect(expectedVlanInterface['label']).to.equal(mockVlan.label);
      expect(expectedVlanInterface['ipam_address']).to.equal('');
    });

    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
  });

  /*
   * - Uses mock API data to confirm that VLANs cannot be assigned to Linodes in regions without capability.
   * - Confirms that VLAN fields are disabled before and after selecting a region.
   */
  it('cannot assign VLANs in regions without capability', () => {
    const nonVlanRegion = regionFactory.build({
      capabilities: ['Linodes'],
    });

    const vlanRegion = regionFactory.build({
      capabilities: ['Linodes', 'Vlans'],
    });

    mockGetRegions([nonVlanRegion, vlanRegion]);
    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.selectRegionById(nonVlanRegion.id);

    // Confirm the Linode Interfaces section is not present.
    assertNewLinodeInterfacesIsAvailable(false);

    // Expand VLAN accordion, confirm VLAN availability notice is displayed and
    // that VLAN fields are disabled while no region is selected.
    ui.accordionHeading.findByTitle('VLAN').click();
    ui.accordion
      .findByTitle('VLAN')
      .scrollIntoView()
      .within(() => {
        cy.findByText('VLAN is not available in the selected region.', {
          exact: false,
        }).should('be.visible');
        cy.findByLabelText('VLAN').should('be.disabled');
        cy.findByLabelText(/IPAM Address/).should('be.disabled');
      });

    // Select a region that is known not to have VLAN capability.
    linodeCreatePage.selectRegionById(nonVlanRegion.id);

    // Confirm that VLAN fields are still disabled.
    ui.accordion
      .findByTitle('VLAN')
      .scrollIntoView()
      .within(() => {
        cy.findByLabelText('VLAN').should('be.disabled');
        cy.findByLabelText(/IPAM Address/).should('be.disabled');
      });
  });
});

describe('Create Linode with VLANs (Linode Interfaces)', () => {
  const mockLinodeRegion: Region = regionFactory.build({
    id: 'us-east',
    label: 'Newark, NJ',
    capabilities: ['Linodes', 'Linode Interfaces', 'Vlans'],
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
    mockGetRegions([mockLinodeRegion]);
    mockGetRegion(mockLinodeRegion);
  });

  /*
   * Legacy Configuration Profile Interfaces
   * - Uses mock API data to confirm VLAN attachment UI flow during Linode create.
   * - Confirms that outgoing Linode create API request contains expected data for VLAN.
   * - Confirms that attached VLAN is reflected in the Linode create summary.
   */
  it('can assign existing VLANs during Linode create flow (legacy)', () => {
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
    });

    const mockVlan = VLANFactory.build({
      cidr_block: `${randomIp()}/24`,
      id: randomNumber(),
      label: randomLabel(),
      linodes: [],
      region: mockLinodeRegion.id,
    });

    mockGetVLANs([mockVlan]);
    mockCreateLinode(mockLinode).as('createLinode');
    cy.visitWithLogin('/linodes/create');

    // Fill out necessary Linode create fields.
    linodeCreatePage.selectRegionById(mockLinodeRegion.id);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Open VLAN accordion and select existing VLAN.
    cy.get('[data-qa-select-card-heading="VLAN"]').should('be.visible').click();
    cy.findByLabelText('VLAN').should('be.enabled').type(mockVlan.label);
    ui.autocompletePopper
      .findByTitle(mockVlan.label)
      .should('be.visible')
      .click();
    cy.findByLabelText(/IPAM Address/)
      .should('be.enabled')
      .type(mockVlan.cidr_block);

    // Confirm that VLAN attachment is listed in summary, then create Linode.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      // TODO: M3-9955 Missing info in Summary section
      // cy.findByText('VLAN Attached').should('be.visible');
    });

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm outgoing API request payload has expected data.
    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const expectedVlanInterface = requestPayload['interfaces'][0];

      // Confirm that second interface is our chosen VLAN.
      expect(expectedVlanInterface['purpose']).to.equal('vlan');
      expect(expectedVlanInterface['label']).to.equal(mockVlan.label);
      expect(expectedVlanInterface['ipam_address']).to.equal(
        mockVlan.cidr_block
      );
    });

    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
  });

  /*
   * Linode Interfaces
   * - Uses mock API data to confirm VLAN attachment UI flow during Linode create.
   * - Confirms that outgoing Linode create API request contains expected data for VLAN.
   * - Confirms that attached VLAN is reflected in the Linode create summary.
   */
  it('can assign existing VLANs during Linode create flow (Linode Interfaces)', () => {
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
    });

    const mockVlan = VLANFactory.build({
      cidr_block: `${randomIp()}/24`,
      id: randomNumber(),
      label: randomLabel(),
      linodes: [],
      region: mockLinodeRegion.id,
    });

    mockGetVLANs([mockVlan]);
    mockCreateLinode(mockLinode).as('createLinode');
    cy.visitWithLogin('/linodes/create');

    // Fill out necessary Linode create fields.
    linodeCreatePage.selectRegionById(mockLinodeRegion.id);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Switch to Linode Interfaces
    linodeCreatePage.selectLinodeInterfacesType();

    // Select VLAN card
    linodeCreatePage.selectInterfaceCard('VLAN');

    // Open VLAN accordion and select existing VLAN.
    cy.findByLabelText('VLAN').should('be.enabled').type(mockVlan.label);
    ui.autocompletePopper
      .findByTitle(mockVlan.label)
      .should('be.visible')
      .click();
    cy.findByLabelText(/IPAM Address/)
      .should('be.enabled')
      .type(mockVlan.cidr_block);

    // Confirm that VLAN attachment is listed in summary, then create Linode.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      // TODO: M3-9955 Missing info in Summary section
      // cy.findByText('VLAN Attached').should('be.visible');
    });

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm outgoing API request payload has expected data.
    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const expectedVlanInterface = requestPayload['interfaces'][0]['vlan'];

      // Confirm that vlan interface is our chosen VLAN.
      expect(expectedVlanInterface).to.not.equal(null);
      expect(expectedVlanInterface['vlan_label']).to.equal(mockVlan.label);
      expect(expectedVlanInterface['ipam_address']).to.equal(
        mockVlan.cidr_block
      );
    });

    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
  });

  /*
   * Legacy Configuration Profile Interfaces
   * - Uses mock API data to confirm VLAN creation and attachment UI flow during Linode create.
   * - Confirms that outgoing Linode create API request contains expected data for new VLAN.
   * - Confirms that attached VLAN is reflected in the Linode create summary.
   */
  it('can assign new VLANs during Linode create flow (legacy)', () => {
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
    });

    const mockVlan = VLANFactory.build({
      cidr_block: `${randomIp()}/24`,
      id: randomNumber(),
      label: randomLabel(),
      linodes: [],
      region: mockLinodeRegion.id,
    });

    mockGetVLANs([]);
    mockCreateLinode(mockLinode).as('createLinode');
    cy.visitWithLogin('/linodes/create');

    // Fill out necessary Linode create fields.
    linodeCreatePage.selectRegionById(mockLinodeRegion.id);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Select VLAN card
    linodeCreatePage.selectInterfaceCard('VLAN');

    // Open VLAN accordion and specify new VLAN.
    cy.findByLabelText('VLAN').should('be.enabled').type(mockVlan.label);
    ui.autocompletePopper
      .findByTitle(`Create "${mockVlan.label}"`)
      .should('be.visible')
      .click();
    cy.findByLabelText(/IPAM Address/)
      .should('be.enabled')
      .type(mockVlan.cidr_block);

    // Confirm that VLAN attachment is listed in summary, then create Linode.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      // TODO: M3-9955 Missing info in Summary section
      // cy.findByText('VLAN Attached').should('be.visible');
    });

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm outgoing API request payload has expected data.
    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const expectedVlanInterface = requestPayload['interfaces'][0];

      // Confirm that first interface is our chosen VLAN.
      expect(expectedVlanInterface['purpose']).to.equal('vlan');
      expect(expectedVlanInterface['label']).to.equal(mockVlan.label);
      expect(expectedVlanInterface['ipam_address']).to.equal(
        mockVlan.cidr_block
      );
    });

    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
  });

  /*
   * Linode Interfaces
   * - Uses mock API data to confirm VLAN creation and attachment UI flow during Linode create.
   * - Confirms that outgoing Linode create API request contains expected data for new VLAN.
   * - Confirms that attached VLAN is reflected in the Linode create summary.
   */
  it('can assign new VLANs during Linode create flow (Linode Interfaces)', () => {
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
    });

    const mockVlan = VLANFactory.build({
      cidr_block: `${randomIp()}/24`,
      id: randomNumber(),
      label: randomLabel(),
      linodes: [],
      region: mockLinodeRegion.id,
    });

    mockGetVLANs([]);
    mockCreateLinode(mockLinode).as('createLinode');
    cy.visitWithLogin('/linodes/create');

    // Fill out necessary Linode create fields.
    linodeCreatePage.selectRegionById(mockLinodeRegion.id);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Switch to Linode Interfaces
    linodeCreatePage.selectLinodeInterfacesType();

    // Select VLAN card
    linodeCreatePage.selectInterfaceCard('VLAN');

    // Open VLAN accordion and specify new VLAN.
    cy.findByLabelText('VLAN').should('be.enabled').type(mockVlan.label);
    ui.autocompletePopper
      .findByTitle(`Create "${mockVlan.label}"`)
      .should('be.visible')
      .click();
    cy.findByLabelText(/IPAM Address/)
      .should('be.enabled')
      .type(mockVlan.cidr_block);

    // Confirm that VLAN attachment is listed in summary, then create Linode.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      // TODO: M3-9955 Missing info in Summary section
      // cy.findByText('VLAN Attached').should('be.visible');
    });

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm outgoing API request payload has expected data.
    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const expectedVlanInterface = requestPayload['interfaces'][0]['vlan'];

      // Confirm that vlan interface is our chosen VLAN.
      expect(expectedVlanInterface).to.not.equal(null);
      expect(expectedVlanInterface['vlan_label']).to.equal(mockVlan.label);
      expect(expectedVlanInterface['ipam_address']).to.equal(
        mockVlan.cidr_block
      );
    });

    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
  });

  /*
   * - Uses mock API data to confirm that VLANs cannot be assigned to Linodes in regions without capability.
   * - Confirms that VLAN fields are disabled before and after selecting a region.
   */
  it('cannot assign VLANs in regions without capability', () => {
    const nonVlanRegion = regionFactory.build({
      capabilities: ['Linodes'],
    });

    const vlanRegion = mockLinodeRegion;

    mockGetRegions([nonVlanRegion, vlanRegion]);
    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.selectRegionById(nonVlanRegion.id);

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Select VLAN card
    linodeCreatePage.selectInterfaceCard('VLAN');

    // Expand VLAN accordion, confirm VLAN availability notice is displayed and
    // that VLAN fields are disabled while no region is selected.
    cy.findByText('VLAN is not available in the selected region.', {
      exact: false,
    }).should('be.visible');
    cy.get('[data-qa-autocomplete="VLAN"]').within(() => {
      cy.findByLabelText('VLAN').should('be.visible');
      cy.get('[data-testid="textfield-input"]')
        .should('be.visible')
        .should('be.disabled');
    });
    cy.findByLabelText(/IPAM Address/).should('be.disabled');

    // Select a region that is known not to have VLAN capability.
    linodeCreatePage.selectRegionById(nonVlanRegion.id);

    // Confirm that VLAN fields are still disabled.
    cy.get('[data-qa-autocomplete="VLAN"]').within(() => {
      cy.findByLabelText('VLAN').should('be.visible');
      cy.get('[data-testid="textfield-input"]')
        .should('be.visible')
        .should('be.disabled');
    });
    cy.findByLabelText(/IPAM Address/).should('be.disabled');
  });
});
