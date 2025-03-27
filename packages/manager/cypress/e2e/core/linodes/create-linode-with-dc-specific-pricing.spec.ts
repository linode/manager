import { linodeFactory } from '@src/factories';
import {
  dcPricingDocsLabel,
  dcPricingDocsUrl,
  dcPricingMockLinodeTypes,
  dcPricingPlanPlaceholder,
} from 'support/constants/dc-specific-pricing';
import {
  mockCreateLinode,
  mockGetLinodeType,
  mockGetLinodeTypes,
} from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import { getRegionById } from 'support/util/regions';

describe('Create Linode with DC-specific pricing', () => {
  /*
   * - Confirms DC-specific pricing UI flow works as expected during Linode creation.
   * - Confirms that pricing docs link is shown in "Region" section.
   * - Confirms that backups pricing is correct when selecting a region with a different price structure.
   */
  it('shows DC-specific pricing information during create flow', () => {
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
    )!;
    const currentBackupPrice = dcPricingMockLinodeTypes[0].addons.backups.region_prices.find(
      (regionPrice) => regionPrice.id === initialRegion.id
    )!;
    const newPrice = dcPricingMockLinodeTypes[1].region_prices.find(
      (linodeType) => linodeType.id === newRegion.id
    )!;
    const newBackupPrice = dcPricingMockLinodeTypes[1].addons.backups.region_prices.find(
      (regionPrice) => regionPrice.id === newRegion.id
    )!;

    // Mock requests to get individual types.
    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);
    mockGetLinodeTypes(dcPricingMockLinodeTypes).as('getLinodeTypes');

    // intercept request
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getLinodeTypes']);

    mockCreateLinode(mockLinode).as('linodeCreated');

    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');

    ui.button.findByTitle('Create Linode').click();

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
    cy.findByText('Shared CPU').click();
    cy.get(`[id="${dcPricingMockLinodeTypes[0].id}"]`).click();
    // Confirm that the backup prices are displayed as expected.
    cy.get('[data-qa-add-ons="true"]').within(() => {
      cy.findByText(`$${currentBackupPrice.monthly}`).should('be.visible');
      cy.findByText('per month').should('be.visible');
    });
    // Confirm that the checkout summary at the bottom of the page reflects the correct price.
    cy.get('[data-qa-linode-create-summary="true"]').within(() => {
      cy.findByText(`$${currentPrice.monthly!.toFixed(2)}/month`).should(
        'be.visible'
      );
      cy.findByText('Backups').should('be.visible');
      cy.findByText(`$${currentBackupPrice.monthly!.toFixed(2)}/month`).should(
        'be.visible'
      );
    });

    // Confirm there is a docs link to the pricing page.
    cy.findByText(dcPricingDocsLabel)
      .should('be.visible')
      .should('have.attr', 'href', dcPricingDocsUrl);

    ui.regionSelect.find().click().type(`${newRegion.label} {enter}`);
    cy.findByText('Shared CPU').click();
    cy.get(`[id="${dcPricingMockLinodeTypes[0].id}"]`).click();
    // Confirm that the backup prices are displayed as expected.
    cy.get('[data-qa-add-ons="true"]').within(() => {
      cy.findByText(`$${newBackupPrice.monthly}`).should('be.visible');
      cy.findByText('per month').should('be.visible');
    });
    // Confirms that the summary updates to reflect price changes if the user changes their region and plan selection.
    cy.get('[data-qa-linode-create-summary="true"]').within(() => {
      cy.findByText(`$${newPrice.monthly!.toFixed(2)}/month`).should(
        'be.visible'
      );
      cy.findByText('Backups').should('be.visible');
      cy.findByText(`$${newBackupPrice.monthly!.toFixed(2)}/month`).should(
        'be.visible'
      );
    });
  });
});
