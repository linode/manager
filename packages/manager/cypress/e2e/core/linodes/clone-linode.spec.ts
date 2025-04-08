import {
  createLinodeRequestFactory,
  linodeConfigInterfaceFactory,
  linodeFactory,
} from '@linode/utilities';
import {
  VLANFactory,
  linodeConfigFactory,
  volumeFactory,
} from '@src/factories';
import { authenticate } from 'support/api/authentication';
import {
  dcPricingDocsLabel,
  dcPricingDocsUrl,
  dcPricingMockLinodeTypes,
  dcPricingRegionDifferenceNotice,
} from 'support/constants/dc-specific-pricing';
import {
  LINODE_CLONE_TIMEOUT,
  LINODE_CREATE_TIMEOUT,
} from 'support/constants/linodes';
import { mockGetLinodeConfigs } from 'support/intercepts/configs';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  interceptCloneLinode,
  mockCloneLinode,
  mockCreateLinode,
  mockGetLinodeDetails,
  mockGetLinodeType,
  mockGetLinodeTypes,
  mockGetLinodeVolumes,
  mockGetLinodes,
} from 'support/intercepts/linodes';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetVLANs } from 'support/intercepts/vlans';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import {
  randomIp,
  randomLabel,
  randomNumber,
  randomString,
} from 'support/util/random';
import { chooseRegion, getRegionById } from 'support/util/regions';

import type { Linode } from '@linode/api-v4';

/**
 * Returns the Cloud Manager URL to clone a given Linode.
 *
 * @param linode - Linode for which to retrieve clone URL.
 *
 * @returns Cloud Manager Clone URL for Linode.
 */
const getLinodeCloneUrl = (linode: Linode): string => {
  const regionQuery = `&regionID=${linode.region}`;
  const typeQuery = linode.type ? `&typeID=${linode.type}` : '';
  return `/linodes/create?linodeID=${linode.id}${regionQuery}&type=Clone+Linode${typeQuery}`;
};

authenticate();
describe('clone linode', () => {
  before(() => {
    cleanUp('linodes');
  });
  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeInterfaces: { enabled: false },
    });
  });

  /*
   * - Confirms Linode Clone flow via the Linode details page.
   * - Confirms that Linode can be cloned successfully.
   */
  it('can clone a Linode from Linode details page', () => {
    cy.tag('method:e2e', 'purpose:dcTesting');
    const linodeRegion = chooseRegion({ capabilities: ['Vlans'] });
    const linodePayload = createLinodeRequestFactory.build({
      booted: false,
      label: randomLabel(),
      region: linodeRegion.id,
      type: 'g6-nanode-1',
    });

    const newLinodeLabel = `${linodePayload.label}-clone`;

    // Use `vlan_no_internet` security method.
    // This works around an issue where the Linode API responds with a 400
    // when attempting to interact with it shortly after booting up when the
    // Linode is attached to a Cloud Firewall.
    cy.defer(() =>
      createTestLinode(linodePayload, { securityMethod: 'vlan_no_internet' })
    ).then((linode: Linode) => {
      interceptCloneLinode(linode.id).as('cloneLinode');
      cy.visitWithLogin(`/linodes/${linode.id}`);

      // Wait for Linode to boot, then initiate clone flow.
      cy.findByText('OFFLINE', { timeout: LINODE_CREATE_TIMEOUT }).should(
        'be.visible'
      );

      ui.actionMenu
        .findByTitle(`Action menu for Linode ${linode.label}`)
        .should('be.visible')
        .click();

      ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();
      cy.url().should('endWith', getLinodeCloneUrl(linode));

      // Select clone region and Linode type.
      ui.regionSelect.find().click();
      ui.regionSelect.findItemByRegionId(linodeRegion.id).click();

      cy.findByText('Shared CPU').should('be.visible').click();

      cy.get('[id="g6-standard-1"]')
        .closest('[data-qa-radio]')
        .should('be.visible')
        .click();

      // Confirm summary displays expected information and begin clone.
      cy.findByText(`Summary ${newLinodeLabel}`).should('be.visible');

      ui.button
        .findByTitle('Create Linode')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@cloneLinode').then((xhr) => {
        const newLinodeId = xhr.response?.body?.id;
        assert.equal(xhr.response?.statusCode, 200);
        cy.url().should('endWith', `linodes/${newLinodeId}`);
      });

      ui.toast.assertMessage(`Your Linode ${newLinodeLabel} is being created.`);
      ui.toast.assertMessage(
        `Linode ${linode.label} has been cloned to ${newLinodeLabel}.`,
        { timeout: LINODE_CLONE_TIMEOUT }
      );
    });
  });

  /*
   * - Confirms Linode Clone flow can handle null type gracefully.
   * - Confirms that Linode (mock) can be cloned successfully.
   */
  it('can clone a Linode with null type', () => {
    const mockLinodeRegion = chooseRegion({
      capabilities: ['Linodes', 'Vlans'],
    });
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockLinodeRegion.id,
      status: 'offline',
      type: null,
    });
    const mockVolume = volumeFactory.build();
    const mockPublicConfigInterface = linodeConfigInterfaceFactory.build({
      ipam_address: null,
      purpose: 'public',
    });
    const mockConfig = linodeConfigFactory.build({
      id: randomNumber(),
      interfaces: [
        // The order of this array is significant. Index 0 (eth0) should be public.
        mockPublicConfigInterface,
      ],
    });
    const mockVlan = VLANFactory.build({
      cidr_block: `${randomIp()}/24`,
      id: randomNumber(),
      label: randomLabel(),
      linodes: [],
      region: mockLinodeRegion.id,
    });

    const linodeNullTypePayload = createLinodeRequestFactory.build({
      booted: false,
      label: mockLinode.label,
      region: mockLinodeRegion.id,
    });
    const newLinodeLabel = `${linodeNullTypePayload.label}-clone`;
    const clonedLinode = {
      ...mockLinode,
      id: mockLinode.id + 1,
      label: newLinodeLabel,
    };

    mockGetVLANs([mockVlan]);
    mockCreateLinode(mockLinode).as('createLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetLinodeVolumes(clonedLinode.id, [mockVolume]).as('getLinodeVolumes');
    mockGetLinodeConfigs(clonedLinode.id, [mockConfig]).as('getLinodeConfigs');
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

    mockCloneLinode(mockLinode.id, clonedLinode).as('cloneLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}`);

    // Wait for Linode to boot, then initiate clone flow.
    cy.findByText('OFFLINE').should('be.visible');

    ui.actionMenu
      .findByTitle(`Action menu for Linode ${mockLinode.label}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();
    cy.url().should('endWith', getLinodeCloneUrl(mockLinode));

    // Select clone region and Linode type.
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId(mockLinodeRegion.id).click();

    cy.findByText('Shared CPU').should('be.visible').click();

    cy.get('[id="g6-standard-1"]')
      .closest('[data-qa-radio]')
      .should('be.visible')
      .click();

    // Confirm summary displays expected information and begin clone.
    cy.findByText(`Summary ${newLinodeLabel}`).should('be.visible');

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@cloneLinode').then((xhr) => {
      const newLinodeId = xhr.response?.body?.id;
      assert.equal(xhr.response?.statusCode, 200);
      cy.url().should('endWith', `linodes/${newLinodeId}`);
    });

    cy.wait(['@getLinodeVolumes', '@getLinodeConfigs']);
    ui.toast.assertMessage(`Your Linode ${newLinodeLabel} is being created.`);
  });

  /*
   * - Confirms DC-specific pricing UI flow works as expected during Linode clone.
   * - Confirms that pricing docs link is shown in "Region" section.
   * - Confirms that notice is shown when selecting a region with a different price structure.
   */
  it('shows DC-specific pricing information during clone flow', () => {
    const mockRegions = [getRegionById('us-west'), getRegionById('us-east')];
    mockGetRegions(mockRegions).as('getRegions');
    const initialRegion = mockRegions[0];
    const newRegion = mockRegions[1];
    const mockLinode = linodeFactory.build({
      region: initialRegion.id,
      type: dcPricingMockLinodeTypes[0].id,
    });

    mockGetLinodes([mockLinode]).as('getLinodes');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');

    // Mock requests to get all Linode types, and to get individual types.
    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);
    mockGetLinodeTypes(dcPricingMockLinodeTypes).as('getLinodeTypes');

    cy.visitWithLogin(getLinodeCloneUrl(mockLinode));
    cy.wait(['@getRegions', '@getLinode', '@getLinodes', '@getLinodeTypes']);

    // Confirm there is a docs link to the pricing page.
    cy.findByText(dcPricingDocsLabel)
      .should('be.visible')
      .should('have.attr', 'href', dcPricingDocsUrl);

    // Confirm that DC-specific pricing difference notice is not yet shown.
    cy.findByText(dcPricingRegionDifferenceNotice, { exact: false }).should(
      'not.exist'
    );

    ui.regionSelect
      .findBySelectedItem(`${initialRegion.label} (${initialRegion.id})`)
      .click()
      .type(`${newRegion.label}{enter}`);

    cy.findByText(dcPricingRegionDifferenceNotice, { exact: false }).should(
      'be.visible'
    );
  });
});
