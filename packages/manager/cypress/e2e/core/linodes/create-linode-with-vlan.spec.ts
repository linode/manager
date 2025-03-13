import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockCreateLinode } from 'support/intercepts/linodes';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetVLANs } from 'support/intercepts/vlans';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import {
  randomIp,
  randomLabel,
  randomNumber,
  randomString,
} from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { VLANFactory, linodeFactory, regionFactory } from 'src/factories';

describe('Create Linode with VLANs', () => {
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
