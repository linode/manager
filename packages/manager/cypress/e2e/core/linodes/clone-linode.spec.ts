import { Linode, createLinode } from '@linode/api-v4';
import { linodeFactory, createLinodeRequestFactory } from '@src/factories';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import {
  interceptCloneLinode,
  mockGetLinodeDetails,
  mockGetLinodes,
  mockGetLinodeType,
  mockGetLinodeTypes,
} from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import {
  dcPricingRegionNotice,
  dcPricingMockLinodeTypes,
  dcPricingRegionDifferenceNotice,
} from 'support/constants/dc-specific-pricing';
import { chooseRegion, getRegionById } from 'support/util/regions';
import { randomLabel } from 'support/util/random';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';

/**
 * Returns the Cloud Manager URL to clone a given Linode.
 *
 * @param linode - Linode for which to retrieve clone URL.
 * @param withRegion - Whether to append a region query to the URL.
 *
 * @returns Cloud Manager Clone URL for Linode.
 */
const getLinodeCloneUrl = (
  linode: Linode,
  withRegion: boolean = true
): string => {
  const regionQuery = withRegion ? `&regionID=${linode.region}` : '';
  const typeQuery = `&typeID=${linode.type}`;
  return `/linodes/create?linodeID=${linode.id}&type=Clone+Linode${typeQuery}${regionQuery}`;
};

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
    const linodeRegion = chooseRegion();
    const linodePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: linodeRegion.id,
      // Specifying no image allows the Linode to provision and clone faster.
      image: undefined,
      type: 'g6-nanode-1',
    });

    const newLinodeLabel = `${linodePayload.label}-clone`;

    // TODO: DC Pricing - M3-7073: Remove feature flag mocks once DC pricing is live.
    mockAppendFeatureFlags({
      dcSpecificPricing: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.defer(createLinode(linodePayload)).then((linode: Linode) => {
      interceptCloneLinode(linode.id).as('cloneLinode');
      cy.visitWithLogin(`/linodes/${linode.id}`);

      // Wait for Linode to boot, then initiate clone flow.
      cy.findByText('OFFLINE').should('be.visible');

      ui.actionMenu
        .findByTitle(`Action menu for Linode ${linode.label}`)
        .should('be.visible')
        .click();

      ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();

      // Cloning from Linode Details page does not pre-select a region.
      // (Cloning from the Linodes landing does pre-select a region, however.)
      cy.url().should('endWith', getLinodeCloneUrl(linode, false));

      // Select clone region and Linode type.
      cy.findByText('Select a Region')
        .should('be.visible')
        .click()
        .type(`${linodeRegion.label}{enter}`);

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
        `Linode ${linode.label} successfully cloned to ${newLinodeLabel}.`
      );
    });
  });

  /*
   * - Confirms DC-specific pricing UI flow works as expected during Linode clone.
   * - Confirms that pricing notice is shown in "Region" section.
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
    mockAppendFeatureFlags({
      dcSpecificPricing: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Mock requests to get all Linode types, and to get individual types.
    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);
    mockGetLinodeTypes(dcPricingMockLinodeTypes).as('getLinodeTypes');

    cy.visitWithLogin(getLinodeCloneUrl(mockLinode));
    cy.wait([
      '@getClientStream',
      '@getFeatureFlags',
      '@getLinode',
      '@getLinodes',
      '@getLinodeTypes',
    ]);

    cy.findByText(dcPricingRegionNotice, { exact: false }).should('be.visible');

    // TODO: DC Pricing - M3-7086: Uncomment docs link assertion when docs links are added.
    // cy.findByText(dcPricingDocsLabel)
    //   .should('be.visible')
    //   .should('have.attr', 'href', dcPricingDocsUrl);

    // Confirm that DC-specific pricing difference notice is not yet shown.
    cy.findByText(dcPricingRegionDifferenceNotice, { exact: false }).should(
      'not.exist'
    );

    cy.findByText(`${initialRegion.label} (${initialRegion.id})`)
      .should('be.visible')
      .click()
      .type(`${newRegion.label}{enter}`);

    cy.findByText(dcPricingRegionDifferenceNotice, { exact: false }).should(
      'be.visible'
    );
  });
});
