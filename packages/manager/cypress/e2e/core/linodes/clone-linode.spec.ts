import { Linode } from '@linode/api-v4';
import { linodeFactory } from '@src/factories';
import { createLinode } from 'support/api/linodes';
import {
  containsClick,
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
} from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { apiMatcher } from 'support/util/intercepts';
import {
  tieredPricingRegionNotice,
  tieredPricingDocsLabel,
  tieredPricingDocsUrl,
  tieredPricingPlanPlaceholder,
} from 'support/constants/tiered-pricing';

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

  it.only('shows tiered pricing information during clone flow', () => {
    const mockLinode = linodeFactory.build();
    mockGetLinodes([mockLinode]).as('getLinodes');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockAppendFeatureFlags({
      dcSpecificPricing: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin(getLinodeCloneUrl(mockLinode));
    cy.wait([
      '@getLinodes',
      '@getLinode',
      '@getFeatureFlags',
      '@getClientStream',
    ]);

    // TODO Move these assertions to end-to-end test once `dcSpecificPricing` flag goes away.
    cy.findByText(tieredPricingRegionNotice, { exact: false }).should(
      'be.visible'
    );
    cy.findByText(tieredPricingDocsLabel)
      .should('be.visible')
      .should('have.attr', 'href', tieredPricingDocsUrl);

    //cy.findByText(tieredPricingPlanPlaceholder).should('be.visible');

    cy.wait(100000);
  });
});
