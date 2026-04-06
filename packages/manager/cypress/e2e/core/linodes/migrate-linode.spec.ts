import { linodeFactory, regionFactory } from '@linode/utilities';
import { linodeDiskFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import {
  dcPricingCurrentPriceLabel,
  dcPricingMockLinodeTypes,
  dcPricingNewPriceLabel,
} from 'support/constants/dc-specific-pricing';
import {
  mockGetLinodeDetails,
  mockGetLinodeDisks,
  mockGetLinodeType,
  mockGetLinodeVolumes,
  mockMigrateLinode,
} from 'support/intercepts/linodes';
import { mockGetRegion, mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { apiMatcher } from 'support/util/intercepts';
import { extendRegion } from 'support/util/regions';

const mockRegionStart = extendRegion(
  regionFactory.build({
    id: 'us-west',
    capabilities: ['Linodes'],
  })
);

const mockRegionStartSimilarPricing = extendRegion(
  regionFactory.build({
    id: 'us-central',
    capabilities: ['Linodes'],
  })
);

const mockRegionEnd = extendRegion(
  regionFactory.build({
    id: 'us-east',
    capabilities: ['Linodes'],
  })
);

const mockRegionEndSimilarPricing = extendRegion(
  regionFactory.build({
    id: 'eu-central',
    capabilities: ['Linodes'],
  })
);

const mockRegions = [
  mockRegionStart,
  mockRegionStartSimilarPricing,
  mockRegionEnd,
  mockRegionEndSimilarPricing,
];

authenticate();
describe('Migrate linodes', () => {
  beforeEach(() => {
    mockGetRegions(mockRegions);
    mockGetRegion(mockRegionStart);
    mockGetRegion(mockRegionStartSimilarPricing);
    mockGetRegion(mockRegionEnd);
    mockGetRegion(mockRegionEndSimilarPricing);
  });

  /*
   * - Confirms that flow works as expected during Linode migration between two regions without pricing changes.
   */
  it('can migrate linodes', () => {
    const mockLinode = linodeFactory.build({
      region: mockRegionStart.id,
    });

    const mockLinodeDisks = linodeDiskFactory.buildList(3);

    mockGetRegions(mockRegions);
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');

    // Mock request to get Linode volumes and disks
    mockGetLinodeDisks(mockLinode.id, mockLinodeDisks).as('getLinodeDisks');
    mockGetLinodeVolumes(mockLinode.id, []).as('getLinodeVolumes');

    cy.visitWithLogin(`/linodes/${mockLinode.id}?migrate=true`);
    cy.wait(['@getLinode', '@getLinodeDisks', '@getLinodeVolumes']);

    ui.button.findByTitle('Enter Migration Queue').should('be.disabled');
    cy.findByText(`${mockRegionStart.label}`).should('be.visible');
    cy.get('[data-qa-checked="false"]').click();
    cy.findByText(`North America: ${mockRegionStart.label}`).should(
      'be.visible'
    );

    ui.regionSelect.find().click();
    ui.regionSelect
      .findItemByRegionLabel(mockRegionEnd.label, mockRegions)
      .click();

    // intercept migration request and stub it, respond with 200
    cy.intercept(
      'POST',
      apiMatcher(`linode/instances/${mockLinode.id}/migrate`),
      {
        statusCode: 200,
      }
    ).as('migrateReq');

    ui.button
      .findByTitle('Enter Migration Queue')
      .scrollIntoView()
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@migrateReq').its('response.statusCode').should('eq', 200);
  });

  /*
   * - Confirms DC-specific pricing UI flow works as expected during Linode migration.
   * - Confirms that pricing comparison is shown in "Region" section when migration occurs in DCs with different price structures.
   */
  it('shows DC-specific pricing information when migrating linodes between differently priced DCs', () => {
    const mockLinode = linodeFactory.build({
      region: mockRegionStart.id,
      type: dcPricingMockLinodeTypes[0].id,
    });

    const mockLinodeDisks = linodeDiskFactory.buildList(3);

    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');

    // Mock request to get Linode volumes and disks
    mockGetLinodeDisks(mockLinode.id, mockLinodeDisks).as('getLinodeDisks');
    mockGetLinodeVolumes(mockLinode.id, []).as('getLinodeVolumes');

    // Mock requests to get get individual types.
    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);

    cy.visitWithLogin(`/linodes/${mockLinode.id}?migrate=true`);
    cy.wait(['@getLinode', '@getLinodeDisks', '@getLinodeVolumes']);

    ui.button.findByTitle('Enter Migration Queue').should('be.disabled');
    cy.findByText(`${mockRegionStart.label}`).should('be.visible');
    cy.get('[data-qa-checked="false"]').click();
    cy.findByText(`North America: ${mockRegionStart.label}`).should(
      'be.visible'
    );

    ui.regionSelect.find().click();
    ui.regionSelect
      .findItemByRegionLabel(mockRegionEnd.label, mockRegions)
      .click();

    cy.findByText(dcPricingCurrentPriceLabel).should('be.visible');
    const currentPrice = dcPricingMockLinodeTypes[0].region_prices.find(
      (regionPrice) => regionPrice.id === mockRegionStart.id
    )!;
    const currentBackupPrice =
      dcPricingMockLinodeTypes[0].addons.backups.region_prices.find(
        (regionPrice) => regionPrice.id === mockRegionStart.id
      )!;
    cy.get('[data-testid="current-price-panel"]').within(() => {
      cy.findByText(`$${currentPrice.monthly!.toFixed(2)}`).should(
        'be.visible'
      );
      cy.findByText(`$${currentPrice.hourly}`).should('be.visible');
      cy.findByText(`$${currentBackupPrice.monthly}`).should('be.visible');
    });

    cy.findByText(dcPricingNewPriceLabel).should('be.visible');
    const newPrice = dcPricingMockLinodeTypes[1].region_prices.find(
      (linodeType) => linodeType.id === mockRegionEnd.id
    )!;
    const newBackupPrice =
      dcPricingMockLinodeTypes[1].addons.backups.region_prices.find(
        (regionPrice) => regionPrice.id === mockRegionEnd.id
      )!;
    cy.get('[data-testid="new-price-panel"]').within(() => {
      cy.findByText(`$${newPrice.monthly!.toFixed(2)}`).should('be.visible');
      cy.findByText(`$${newPrice.hourly}`).should('be.visible');
      cy.findByText(`$${newBackupPrice.monthly}`).should('be.visible');
    });

    // intercept migration request and stub it, respond with 200
    mockMigrateLinode(mockLinode.id).as('migrateReq');

    ui.button
      .findByTitle('Enter Migration Queue')
      .scrollIntoView()
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@migrateReq').its('response.statusCode').should('eq', 200);
  });

  /*
   * - Confirms DC-specific pricing UI flow works as expected during Linode migration.
   * - Confirms that pricing comparison is not shown in "Region" section if migration occurs in a DC with the same price structure.
   */
  it('shows DC-specific pricing information when migrating linodes to similarly priced DCs', () => {
    const mockLinode = linodeFactory.build({
      region: mockRegionStartSimilarPricing.id,
      type: dcPricingMockLinodeTypes[0].id,
    });

    const mockLinodeDisks = linodeDiskFactory.buildList(3);

    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');

    // Mock request to get Linode volumes and disks
    mockGetLinodeDisks(mockLinode.id, mockLinodeDisks).as('getLinodeDisks');
    mockGetLinodeVolumes(mockLinode.id, []).as('getLinodeVolumes');

    // Mock requests to get individual types.
    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);

    cy.visitWithLogin(`/linodes/${mockLinode.id}?migrate=true`);
    cy.wait(['@getLinode', '@getLinodeDisks', '@getLinodeVolumes']);

    ui.button.findByTitle('Enter Migration Queue').should('be.disabled');
    cy.findByText(`${mockRegionStartSimilarPricing.label}`).should(
      'be.visible'
    );
    cy.get('[data-qa-checked="false"]').click();

    // Confirm that user cannot select the Linode's current DC when migrating.
    // TODO Consider refactoring this flow into its own test.
    ui.autocomplete
      .findByLabel('New Region')
      .click()
      .type(mockRegionStartSimilarPricing.id);

    ui.autocompletePopper.find().within(() => {
      cy.contains(mockRegionStartSimilarPricing.id).should('not.exist');
      cy.findByText('No results').should('be.visible');
    });

    // Confirm that DC pricing information does not show up
    cy.findByText(dcPricingCurrentPriceLabel).should('not.exist');
    cy.get('[data-testid="current-price-panel"]').should('not.exist');
    cy.findByText(dcPricingNewPriceLabel).should('not.exist');
    cy.get('[data-testid="new-price-panel"]').should('not.exist');
    // Change region selection to another region with the same price structure.
    ui.regionSelect
      .find()
      .click()
      .clear()
      .type(`${mockRegionEndSimilarPricing.label}{enter}`);
    // Confirm that DC pricing information still does not show up.
    cy.findByText(dcPricingCurrentPriceLabel).should('not.exist');
    cy.get('[data-testid="current-price-panel"]').should('not.exist');
    cy.findByText(dcPricingNewPriceLabel).should('not.exist');
    cy.get('[data-testid="new-price-panel"]').should('not.exist');
    // Confirm that migration queue button is enabled.
    ui.button
      .findByTitle('Enter Migration Queue')
      .scrollIntoView()
      .should('be.visible')
      .should('be.enabled');
  });
});
