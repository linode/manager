import { linodeFactory, regionFactory, VLANFactory } from 'src/factories';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { chooseRegion } from 'support/util/regions';
import {
  randomIp,
  randomLabel,
  randomNumber,
  randomString,
} from 'support/util/random';
import { mockGetVLANs } from 'support/intercepts/vlans';
import { mockCreateLinode } from 'support/intercepts/linodes';

describe('Create Linode with VLANs', () => {
  // TODO Remove feature flag mocks when `linodeCreateRefactor` flag is retired.
  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeCreateRefactor: makeFeatureFlagData(true),
    });
    mockGetFeatureFlagClientstream();
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
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
      cidr_block: `${randomIp()}/24`,
      linodes: [],
    });

    mockGetVLANs([mockVlan]);
    mockCreateLinode(mockLinode).as('createLinode');
    cy.visitWithLogin('/linodes/create');

    // Fill out necessary Linode create fields.
    linodeCreatePage.selectRegionById(mockLinodeRegion.id);
    linodeCreatePage.selectImage('Debian 11');
    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

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
    cy.get('[data-qa-linode-create-summary]')
      .scrollIntoView()
      .within(() => {
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
    // TODO Confirm whether toast notification should appear on Linode create.
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
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
      cidr_block: `${randomIp()}/24`,
      linodes: [],
    });

    mockGetVLANs([]);
    mockCreateLinode(mockLinode).as('createLinode');
    cy.visitWithLogin('/linodes/create');

    // Fill out necessary Linode create fields.
    linodeCreatePage.selectRegionById(mockLinodeRegion.id);
    linodeCreatePage.selectImage('Debian 11');
    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

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
    cy.get('[data-qa-linode-create-summary]')
      .scrollIntoView()
      .within(() => {
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
      expect(expectedVlanInterface['ipam_address']).to.equal('');
    });

    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // TODO Confirm whether toast notification should appear on Linode create.
  });

  /*
   * - Uses mock API data to confirm that VLANs cannot be assigned to Linodes in regions without capability.
   * - Confirms that VLAN fields are disabled before and after selecting a region.
   */
  it('cannot assign VLANs in regions without capability', () => {
    const availabilityNotice =
      'VLANs are currently available in select regions.';

    const nonVlanRegion = regionFactory.build({
      capabilities: ['Linodes'],
    });

    const vlanRegion = regionFactory.build({
      capabilities: ['Linodes', 'Vlans'],
    });

    mockGetRegions([nonVlanRegion, vlanRegion]);
    cy.visitWithLogin('/linodes/create');

    // Expand VLAN accordion, confirm VLAN availability notice is displayed and
    // that VLAN fields are disabled while no region is selected.
    ui.accordionHeading.findByTitle('VLAN').click();
    ui.accordion
      .findByTitle('VLAN')
      .scrollIntoView()
      .within(() => {
        cy.contains(availabilityNotice).should('be.visible');
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
