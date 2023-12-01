import {
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick,
} from 'support/helpers';
import { ui } from 'support/ui';
import { apiMatcher } from 'support/util/intercepts';
import { randomString, randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { getRegionById } from 'support/util/regions';
import { linodeFactory, regionFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';
import { mockGetRegions } from 'support/intercepts/regions';
import {
  dcPricingPlanPlaceholder,
  dcPricingMockLinodeTypes,
  dcPricingDocsLabel,
  dcPricingDocsUrl,
} from 'support/constants/dc-specific-pricing';
import { mockCreateLinode } from 'support/intercepts/linodes';
import {
  mockGetLinodeType,
  mockGetLinodeTypes,
} from 'support/intercepts/linodes';

import type { Region } from '@linode/api-v4';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';

const mockRegions: Region[] = [
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'uk',
    id: 'eu-west',
    label: 'London, UK',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'sg',
    id: 'ap-south',
    label: 'Singapore, SG',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-east',
    label: 'Newark, NJ',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-central',
    label: 'Dallas, TX',
  }),
];

authenticate();
describe('create linode', () => {
  before(() => {
    cleanUp('linodes');
  });

  /*
   * Region select test.
   * - Confirms that region select dropdown is visible and interactive.
   * - Confirms that region select dropdown is populated with expected regions.
   * - Confirms that region select dropdown is sorted alphabetically by region, with North America first.
   * - Confirms that region select dropdown is populated with expected DCs, sorted alphabetically.
   */
  it('region select', () => {
    mockGetRegions(mockRegions).as('getRegions');

    mockAppendFeatureFlags({
      soldOutTokyo: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    cy.visitWithLogin('linodes/create');

    cy.wait(['@getClientStream', '@getFeatureFlags', '@getRegions']);

    // Confirm that region select dropdown is visible and interactive.
    ui.regionSelect.find().click();
    cy.get('[data-qa-autocomplete-popper="true"]').should('be.visible');

    // Confirm that region select dropdown are grouped by region,
    // sorted alphabetically, with North America first.
    cy.get('.MuiAutocomplete-groupLabel')
      .should('have.length', 3)
      .should((group) => {
        expect(group[0]).to.contain('North America');
        expect(group[1]).to.contain('Asia');
        expect(group[2]).to.contain('Europe');
      });

    // Confirm that region select dropdown is populated with expected regions, sorted alphabetically.
    cy.get('[data-qa-option]').should('exist').should('have.length', 4);
    mockRegions.forEach((region) => {
      cy.get('[data-qa-option]').contains(region.label);
    });

    // Select an option
    cy.findByTestId('eu-west').click();
    // Confirm the popper is closed
    cy.get('[data-qa-autocomplete-popper="true"]').should('not.exist');
    // Confirm that the selected region is displayed in the input field.
    cy.get('[data-testid="textfield-input"]').should(
      'have.value',
      'London, UK (eu-west)'
    );

    // Confirm that selecting a valid region updates the Plan Selection panel.
    expect(cy.get('[data-testid="table-row-empty"]').should('not.exist'));
  });

  it('creates a nanode', () => {
    const rootpass = randomString(32);
    const linodeLabel = randomLabel();
    // intercept request
    cy.visitWithLogin('/linodes/create');
    cy.get('[data-qa-deploy-linode]');
    cy.intercept('POST', apiMatcher('linode/instances')).as('linodeCreated');
    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionLabel(chooseRegion().label).click();
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

    ui.regionSelect.find().click();
    ui.autocompletePopper
      .findByTitle(`${linodeRegion.label} (${linodeRegion.id})`)
      .should('exist')
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
   * - Confirms that pricing docs link is shown in "Region" section.
   * - Confirms that backups pricing is correct when selecting a region with a different price structure.
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

    const currentPrice = dcPricingMockLinodeTypes[0].region_prices.find(
      (regionPrice) => regionPrice.id === initialRegion.id
    );
    const currentBackupPrice = dcPricingMockLinodeTypes[0].addons.backups.region_prices.find(
      (regionPrice) => regionPrice.id === initialRegion.id
    );
    const newPrice = dcPricingMockLinodeTypes[1].region_prices.find(
      (linodeType) => linodeType.id === newRegion.id
    );
    const newBackupPrice = dcPricingMockLinodeTypes[1].addons.backups.region_prices.find(
      (regionPrice) => regionPrice.id === newRegion.id
    );

    // Mock requests to get individual types.
    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);
    mockGetLinodeTypes(dcPricingMockLinodeTypes).as('getLinodeTypes');

    // intercept request
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getLinodeTypes']);

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

    // Check the 'Backups' add on
    cy.get('[data-testid="backups"]').should('be.visible').click();
    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionLabel(initialRegion.label).click();
    fbtClick('Shared CPU');
    getClick(`[id="${dcPricingMockLinodeTypes[0].id}"]`);
    // Confirm that the backup prices are displayed as expected.
    cy.get('[data-qa-add-ons="true"]')
      .eq(1)
      .within(() => {
        cy.findByText(`$${currentBackupPrice.monthly}`).should('be.visible');
        cy.findByText('per month').should('be.visible');
      });
    // Confirm that the checkout summary at the bottom of the page reflects the correct price.
    cy.get('[data-qa-summary="true"]').within(() => {
      cy.findByText(`$${currentPrice.monthly.toFixed(2)}/month`).should(
        'be.visible'
      );
      cy.findByText('Backups').should('be.visible');
      cy.findByText(`$${currentBackupPrice.monthly.toFixed(2)}/month`).should(
        'be.visible'
      );
    });

    // Confirm there is a docs link to the pricing page.
    cy.findByText(dcPricingDocsLabel)
      .should('be.visible')
      .should('have.attr', 'href', dcPricingDocsUrl);

    ui.regionSelect.find().click().type(`${newRegion.label} {enter}`);
    fbtClick('Shared CPU');
    getClick(`[id="${dcPricingMockLinodeTypes[0].id}"]`);
    // Confirm that the backup prices are displayed as expected.
    cy.get('[data-qa-add-ons="true"]')
      .eq(1)
      .within(() => {
        cy.findByText(`$${newBackupPrice.monthly}`).should('be.visible');
        cy.findByText('per month').should('be.visible');
      });
    // Confirms that the summary updates to reflect price changes if the user changes their region and plan selection.
    cy.get('[data-qa-summary="true"]').within(() => {
      cy.findByText(`$${newPrice.monthly.toFixed(2)}/month`).should(
        'be.visible'
      );
      cy.findByText('Backups').should('be.visible');
      cy.findByText(`$${newBackupPrice.monthly.toFixed(2)}/month`).should(
        'be.visible'
      );
    });

    getClick('#linode-label').clear().type(linodeLabel);
    cy.get('#root-password').type(rootpass);
    getClick('[data-qa-deploy-linode]');
    cy.wait('@linodeCreated').its('response.statusCode').should('eq', 200);
    fbtVisible(linodeLabel);
    cy.contains('RUNNING', { timeout: 300000 }).should('be.visible');
  });
});
