import { linodeFactory, createLinodeRequestFactory } from '@src/factories';
import {
  interceptCloneLinode,
  mockGetLinodeDetails,
  mockGetLinodes,
  mockGetLinodeType,
  mockGetLinodeTypes,
} from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import {
  dcPricingMockLinodeTypes,
  dcPricingRegionDifferenceNotice,
  dcPricingDocsLabel,
  dcPricingDocsUrl,
} from 'support/constants/dc-specific-pricing';
import { chooseRegion, getRegionById } from 'support/util/regions';
import { randomLabel } from 'support/util/random';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
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
  const typeQuery = `&typeID=${linode.type}`;
  return `/linodes/create?linodeID=${linode.id}${regionQuery}&type=Clone+Linode${typeQuery}`;
};

/* Timeout after 4 minutes while waiting for clone. */
const CLONE_TIMEOUT = 240_000;

authenticate();
describe('clone linode', () => {
  before(() => {
    cleanUp('linodes');
  });

  /*
   * - Confirms Linode Clone flow via the Linode details page.
   * - Confirms that Linode can be cloned successfully.
   */
  it('can clone a Linode from Linode details page', () => {
    cy.tag('method:e2e', 'purpose:dcTesting');
    const linodeRegion = chooseRegion({ capabilities: ['Vlans'] });
    const linodePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: linodeRegion.id,
      booted: false,
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
      cy.findByText('OFFLINE').should('be.visible');

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
        { timeout: CLONE_TIMEOUT }
      );
    });
  });

  /*
   * - Confirms DC-specific pricing UI flow works as expected during Linode clone.
   * - Confirms that pricing docs link is shown in "Region" section.
   * - Confirms that notice is shown when selecting a region with a different price structure.
   */
  it('shows DC-specific pricing information during clone flow', () => {
    const initialRegion = getRegionById('us-west');
    const newRegion = getRegionById('us-east');

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
    cy.wait(['@getLinode', '@getLinodes', '@getLinodeTypes']);

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
