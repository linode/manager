import {
  containsClick,
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick,
} from 'support/helpers';
import { selectRegionString } from 'support/ui/constants';
import { ui } from 'support/ui';
import { apiMatcher } from 'support/util/intercepts';
import { randomString, randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { getRegionById } from 'support/util/regions';
import { linodeFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import {
  dcPricingRegionNotice,
  dcPricingPlanPlaceholder,
  dcPricingMockLinodeTypes,
} from 'support/constants/dc-specific-pricing';
import { mockCreateLinode } from 'support/intercepts/linodes';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import {
  mockGetLinodeType,
  mockGetLinodeTypes,
} from 'support/intercepts/linodes';

authenticate();
describe('create linode', () => {
  before(() => {
    cleanUp('linodes');
  });

  it('creates a nanode', () => {
    const rootpass = randomString(32);
    const linodeLabel = randomLabel();
    // intercept request
    cy.visitWithLogin('/linodes/create');
    cy.get('[data-qa-deploy-linode]');
    cy.intercept('POST', apiMatcher('linode/instances')).as('linodeCreated');
    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');
    containsClick(selectRegionString).type(`${chooseRegion().label} {enter}`);
    fbtClick('Shared CPU');
    getClick('[id="g6-nanode-1"]');
    getClick('#linode-label').clear().type(linodeLabel);
    cy.get('#root-password').type(rootpass);
    getClick('[data-qa-deploy-linode]');
    cy.wait('@linodeCreated').its('response.statusCode').should('eq', 200);
    ui.toast.assertMessage(`Your Linode ${linodeLabel} is being created.`);
    containsVisible('PROVISIONING');
    fbtVisible(linodeLabel);
    cy.contains('RUNNING', { timeout: 300000 }).should('be.visible');
  });

  it('creates a linode via CLI', () => {
    const linodeLabel = randomLabel();
    const linodePass = randomString(32);
    const linodeRegion = chooseRegion();

    cy.visitWithLogin('/linodes/create');

    cy.contains('Select a Region').click();

    ui.regionSelect.findItemByRegionLabel(linodeRegion.label);

    ui.autocompletePopper
      .findByTitle(`${linodeRegion.label} (${linodeRegion.id})`)
      .should('be.visible')
      .click();

    cy.get('[id="g6-dedicated-2"]').click();

    cy.findByLabelText('Linode Label')
      .should('be.visible')
      .should('be.enabled')
      .clear()
      .type(linodeLabel);

    cy.findByLabelText('Root Password')
      .should('be.visible')
      .should('be.enabled')
      .type(linodePass);

    ui.button
      .findByTitle('Create using command line')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.dialog
      .findByTitle('Create Linode')
      .should('be.visible')
      .within(() => {
        // Switch to cURL view if necessary.
        cy.findByText('cURL')
          .should('be.visible')
          .should('have.attr', 'data-selected');

        // Confirm that cURL command has expected details.
        [
          `"region": "${linodeRegion.id}"`,
          `"type": "g6-dedicated-2"`,
          `"label": "${linodeLabel}"`,
          `"root_pass": "${linodePass}"`,
          '"booted": true',
        ].forEach((line: string) =>
          cy.findByText(line, { exact: false }).should('be.visible')
        );

        cy.findByText('Linode CLI').should('be.visible').click();

        [
          `--region ${linodeRegion.id}`,
          '--type g6-dedicated-2',
          `--label ${linodeLabel}`,
          `--root_pass ${linodePass}`,
          `--booted true`,
        ].forEach((line: string) => cy.contains(line).should('be.visible'));

        ui.buttonGroup
          .findButtonByTitle('Close')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
  });

  /*
   * - Confirms DC-specific pricing UI flow works as expected during Linode creation.
   * - Confirms that pricing notice is shown in "Region" section.
   * - Confirms that notice is shown when selecting a region with a different price structure.
   */
  it('shows DC-specific pricing information during create flow', () => {
    const rootpass = randomString(32);
    const linodeLabel = randomLabel();
    const initialRegion = getRegionById('us-west');
    const newRegion = getRegionById('us-east');

    const mockLinode = linodeFactory.build({
      label: linodeLabel,
      region: initialRegion.id,
      type: dcPricingMockLinodeTypes[0].id,
    });

    mockAppendFeatureFlags({
      dcSpecificPricing: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Mock requests to get individual types.
    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);
    mockGetLinodeTypes(dcPricingMockLinodeTypes).as('getLinodeTypes');

    // intercept request
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getClientStream', '@getFeatureFlags', '@getLinodeTypes']);

    mockCreateLinode(mockLinode).as('linodeCreated');
    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');
    getClick('[data-qa-deploy-linode]');

    // A message is shown to instruct users to select a region in order to view plans and prices
    cy.get('[data-qa-tp="Linode Plan"]').should(
      'contain.text',
      'Plan is required.'
    );
    cy.get('[data-qa-tp="Linode Plan"]').should(
      'contain.text',
      dcPricingPlanPlaceholder
    );

    // Confirm that the checkout summary at the bottom of the page reflects the correct price.
    containsClick(selectRegionString).type(`${initialRegion.label} {enter}`);
    fbtClick('Shared CPU');
    getClick(`[id="${dcPricingMockLinodeTypes[0].id}"]`);
    cy.get('[data-qa-summary="true"]').within(() => {
      const currentPrice = dcPricingMockLinodeTypes[0].region_prices.find(
        (regionPrice) => regionPrice.id === initialRegion.id
      );
      cy.findByText(`$${currentPrice.monthly}0/month`).should('be.visible');
    });

    // Confirms that a notice is shown in the "Region" section of the Linode Create form informing the user of tiered pricing
    cy.findByText(dcPricingRegionNotice, { exact: false }).should('be.visible');

    // TODO: DC Pricing - M3-7086: Uncomment docs link assertion when docs links are added.
    // cy.findByText(dcPricingDocsLabel)
    //   .should('be.visible')
    //   .should('have.attr', 'href', dcPricingDocsUrl);

    // Confirms that the summary updates to reflect price changes if the user changes their region and plan selection.
    containsClick(initialRegion.label).type(`${newRegion.label} {enter}`);
    fbtClick('Shared CPU');
    getClick(`[id="${dcPricingMockLinodeTypes[0].id}"]`);
    cy.get('[data-qa-summary="true"]').within(() => {
      const currentPrice = dcPricingMockLinodeTypes[1].region_prices.find(
        (regionPrice) => regionPrice.id === newRegion.id
      );
      cy.findByText(`$${currentPrice.monthly}0/month`).should('be.visible');
    });

    getClick('#linode-label').clear().type(linodeLabel);
    cy.get('#root-password').type(rootpass);
    getClick('[data-qa-deploy-linode]');
    cy.wait('@linodeCreated').its('response.statusCode').should('eq', 200);
    fbtVisible(linodeLabel);
    cy.contains('RUNNING', { timeout: 300000 }).should('be.visible');
  });
});
