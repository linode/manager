import { Linode } from '@linode/api-v4';
import { linodeFactory } from '@src/factories';
import { createLinode } from 'support/api/linodes';
import {
  containsVisible,
  fbtClick,
  getClick,
  getVisible,
} from 'support/helpers';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import {
  mockGetLinodeDetails,
  mockGetLinodes,
  mockGetLinodeType,
  mockGetLinodeTypes,
} from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { apiMatcher } from 'support/util/intercepts';
import {
  tieredPricingRegionNotice,
  tieredPricingMockLinodeTypes,
  tieredPricingRegionDifferenceNotice,
} from 'support/constants/tiered-pricing';
import { getRegionById } from 'support/util/regions';

/**
 * Returns the Cloud Manager URL to clone a given Linode.
 *
 * @param linode - Linode for which to retrieve clone URL.
 *
 * @returns Cloud Manager Clone URL for Linode.
 */
const getLinodeCloneUrl = (linode: Linode): string => {
  return `/linodes/create?linodeID=${linode.id}&type=Clone+Linode&typeID=${linode.type}&regionID=${linode.region}`;
};

describe('clone linode', () => {
  it('clone linode', () => {
    createLinode({ image: null }).then((linode) => {
      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/clone`)
      ).as('cloneLinode');
      cy.visitWithLogin(`/linodes/${linode.id}`);
      containsVisible(linode.label);
      if (
        cy.contains('PROVISIONING', { timeout: 180000 }).should('not.exist') &&
        cy.contains('BOOTING', { timeout: 180000 }).should('not.exist')
      ) {
        ui.actionMenu
          .findByTitle(`Action menu for Linode ${linode.label}`)
          .should('be.visible')
          .click();

        ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();

        cy.contains('Select a Region')
          .should('be.visible')
          .click()
          .type(`Newark, NJ{enter}`);

        getVisible('[data-qa-summary]').within(() => {
          containsVisible(linode.label);
        });
        fbtClick('Shared CPU');
        getClick('[id="g6-nanode-1"]');
        getClick('[data-qa-deploy-linode="true"]');
        cy.wait('@cloneLinode').then((xhr) => {
          const newLinodeLabel = xhr.response?.body?.label;
          assert.equal(xhr.response?.statusCode, 200);
          ui.toast.assertMessage(
            `Your Linode ${newLinodeLabel} is being created.`
          );
          containsVisible(newLinodeLabel);
        });
      }
    });
  });

  /*
   * - Confirms DC-specific pricing UI flow works as expected during Linode clone.
   * - Confirms that pricing notice is shown in "Region" section.
   * - Confirms that notice is shown when selecting a region with a different price structure.
   */
  it('shows tiered pricing information during clone flow', () => {
    const initialRegion = getRegionById('us-west');
    const newRegion = getRegionById('us-east');

    const mockLinode = linodeFactory.build({
      region: initialRegion.id,
      type: tieredPricingMockLinodeTypes[0].id,
    });

    mockGetLinodes([mockLinode]).as('getLinodes');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockAppendFeatureFlags({
      dcSpecificPricing: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Mock requests to get all Linode types, and to get individual types.
    mockGetLinodeType(tieredPricingMockLinodeTypes[0]);
    mockGetLinodeType(tieredPricingMockLinodeTypes[1]);
    mockGetLinodeTypes(tieredPricingMockLinodeTypes).as('getLinodeTypes');

    cy.visitWithLogin(getLinodeCloneUrl(mockLinode));
    cy.wait([
      '@getClientStream',
      '@getFeatureFlags',
      '@getLinode',
      '@getLinodes',
      '@getLinodeTypes',
    ]);

    // TODO Move these assertions to end-to-end test once `dcSpecificPricing` flag goes away.
    // TODO Remove this assertion when tiered pricing notice goes away.
    cy.findByText(tieredPricingRegionNotice, { exact: false }).should(
      'be.visible'
    );

    // TODO Uncomment docs link assertion when docs links are added.
    // cy.findByText(tieredPricingDocsLabel)
    //   .should('be.visible')
    //   .should('have.attr', 'href', tieredPricingDocsUrl);

    // Confirm that tiered pricing difference notice is not yet shown.
    cy.findByText(tieredPricingRegionDifferenceNotice, { exact: false }).should(
      'not.exist'
    );

    cy.findByText(`${initialRegion.label} (${initialRegion.id})`)
      .should('be.visible')
      .click()
      .type(`${newRegion.label}{enter}`);

    cy.findByText(tieredPricingRegionDifferenceNotice, { exact: false }).should(
      'be.visible'
    );
  });
});
