import { authenticate } from 'support/api/authentication';
import {
  mockGetLinodeDisks,
  mockGetLinodeVolumes,
  mockMigrateLinode,
} from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { apiMatcher } from 'support/util/intercepts';
import { linodeFactory } from '@src/factories';
import { mockGetLinodeDetails } from 'support/intercepts/linodes';
import { getClick, fbtClick, containsClick } from 'support/helpers';
import { selectRegionString } from 'support/ui/constants';
import { getRegionById } from 'support/util/regions';
import {
  dcPricingMockLinodeTypes,
  dcPricingCurrentPriceLabel,
  dcPricingNewPriceLabel,
} from 'support/constants/dc-specific-pricing';
import { mockGetLinodeType } from 'support/intercepts/linodes';
import { linodeDiskFactory } from '@src/factories';

authenticate();
describe('Migrate linodes', () => {
  /*
   * - Confirms DC-specific pricing does not show up during Linode migration when the feature flag is not enabled.
   * - TODO This test should be updated to ignore the pricing information when the feature is released.
   */
  it('can migrate linodes without DC-specific pricing comparison information when feature flag is disabled', () => {
    const initialRegion = getRegionById('us-west');
    const newRegion = getRegionById('us-east');

    const mockLinode = linodeFactory.build({
      region: initialRegion.id,
      type: dcPricingMockLinodeTypes[0].id,
    });

    const mockLinodeDisks = linodeDiskFactory.buildList(3);

    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');

    // TODO Remove feature flag mocks once DC pricing is live.
    mockAppendFeatureFlags({
      dcSpecificPricing: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Mock request to get Linode volumes and disks
    mockGetLinodeDisks(mockLinode.id, mockLinodeDisks).as('getLinodeDisks');
    mockGetLinodeVolumes(mockLinode.id, []).as('getLinodeVolumes');

    // Mock requests to get individual types.
    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);

    cy.visitWithLogin(`/linodes/${mockLinode.id}?migrate=true`);
    cy.wait([
      '@getClientStream',
      '@getFeatureFlags',
      '@getLinode',
      '@getLinodeDisks',
      '@getLinodeVolumes',
    ]);

    ui.button.findByTitle('Enter Migration Queue').should('be.disabled');
    cy.findByText(`${initialRegion.label}`).should('be.visible');
    getClick('[data-qa-checked="false"]');
    cy.findByText(`North America: ${initialRegion.label}`).should('be.visible');
    containsClick(selectRegionString);

    ui.regionSelect.findItemByRegionLabel(newRegion.label).click();

    cy.findByText(dcPricingCurrentPriceLabel).should('not.exist');
    const currentPrice = dcPricingMockLinodeTypes[0].region_prices.find(
      (regionPrice) => regionPrice.id === initialRegion.id
    );
    cy.get('[data-testid="current-price-panel"]').should('not.exist');
    cy.findByText(`$${currentPrice.monthly.toFixed(2)}`).should('not.exist');
    cy.findByText(`$${currentPrice.hourly}`).should('not.exist');
    cy.findByText(
      `$${dcPricingMockLinodeTypes[0].addons.backups.price.monthly.toFixed(2)}`
    ).should('not.exist');

    cy.findByText(dcPricingNewPriceLabel).should('not.exist');
    const newPrice = dcPricingMockLinodeTypes[1].region_prices.find(
      (linodeType) => linodeType.id === newRegion.id
    );
    cy.get('[data-testid="new-price-panel"]').should('not.exist');
    cy.findByText(`$${newPrice.monthly.toFixed(2)}`).should('not.exist');
    cy.findByText(`$${newPrice.hourly}`).should('not.exist');
    cy.findByText(
      `$${dcPricingMockLinodeTypes[1].addons.backups.price.monthly.toFixed(2)}`
    ).should('not.exist');

    // intercept migration request and stub it, respond with 200
    cy.intercept(
      'POST',
      apiMatcher(`linode/instances/${mockLinode.id}/migrate`),
      {
        statusCode: 200,
      }
    ).as('migrateReq');

    fbtClick('Enter Migration Queue');
    cy.wait('@migrateReq').its('response.statusCode').should('eq', 200);
  });

  /*
   * - Confirms DC-specific pricing UI flow works as expected during Linode migration.
   * - Confirms that pricing comparison is shown in "Region" section when migration occurs in DCs with different price structures.
   */
  it('shows DC-specific pricing information when migrating linodes between differently priced DCs', () => {
    const initialRegion = getRegionById('us-west');
    const newRegion = getRegionById('us-east');

    const mockLinode = linodeFactory.build({
      region: initialRegion.id,
      type: dcPricingMockLinodeTypes[0].id,
    });

    const mockLinodeDisks = linodeDiskFactory.buildList(3);

    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');

    // TODO: DC Pricing - M3-7073: Remove feature flag mocks once DC pricing is live.
    mockAppendFeatureFlags({
      dcSpecificPricing: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Mock request to get Linode volumes and disks
    mockGetLinodeDisks(mockLinode.id, mockLinodeDisks).as('getLinodeDisks');
    mockGetLinodeVolumes(mockLinode.id, []).as('getLinodeVolumes');

    // Mock requests to get get individual types.
    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);

    cy.visitWithLogin(`/linodes/${mockLinode.id}?migrate=true`);
    cy.wait([
      '@getClientStream',
      '@getFeatureFlags',
      '@getLinode',
      '@getLinodeDisks',
      '@getLinodeVolumes',
    ]);

    ui.button.findByTitle('Enter Migration Queue').should('be.disabled');
    cy.findByText(`${initialRegion.label}`).should('be.visible');
    getClick('[data-qa-checked="false"]');
    cy.findByText(`North America: ${initialRegion.label}`).should('be.visible');
    containsClick(selectRegionString);

    ui.regionSelect.findItemByRegionLabel(newRegion.label).click();

    cy.findByText(dcPricingCurrentPriceLabel).should('be.visible');
    const currentPrice = dcPricingMockLinodeTypes[0].region_prices.find(
      (regionPrice) => regionPrice.id === initialRegion.id
    );
    const currentBackupPrice = dcPricingMockLinodeTypes[0].addons.backups.region_prices.find(
      (regionPrice) => regionPrice.id === initialRegion.id
    );
    cy.get('[data-testid="current-price-panel"]').within(() => {
      cy.findByText(`$${currentPrice.monthly.toFixed(2)}`).should('be.visible');
      cy.findByText(`$${currentPrice.hourly}`).should('be.visible');
      cy.findByText(`$${currentBackupPrice.monthly}`).should('be.visible');
    });

    cy.findByText(dcPricingNewPriceLabel).should('be.visible');
    const newPrice = dcPricingMockLinodeTypes[1].region_prices.find(
      (linodeType) => linodeType.id === newRegion.id
    );
    const newBackupPrice = dcPricingMockLinodeTypes[1].addons.backups.region_prices.find(
      (regionPrice) => regionPrice.id === newRegion.id
    );
    cy.get('[data-testid="new-price-panel"]').within(() => {
      cy.findByText(`$${newPrice.monthly.toFixed(2)}`).should('be.visible');
      cy.findByText(`$${newPrice.hourly}`).should('be.visible');
      cy.findByText(`$${newBackupPrice.monthly}`).should('be.visible');
    });

    // intercept migration request and stub it, respond with 200
    mockMigrateLinode(mockLinode.id).as('migrateReq');

    fbtClick('Enter Migration Queue');
    cy.wait('@migrateReq').its('response.statusCode').should('eq', 200);
  });

  /*
   * - Confirms DC-specific pricing UI flow works as expected during Linode migration.
   * - Confirms that pricing comparison is not shown in "Region" section if migration occurs in a DC with the same price structure.
   */
  it('shows DC-specific pricing information when migrating linodes within the same DC', () => {
    const initialRegion = getRegionById('us-southeast');
    const newRegion = getRegionById('us-central');

    const mockLinode = linodeFactory.build({
      region: initialRegion.id,
      type: dcPricingMockLinodeTypes[0].id,
    });

    const mockLinodeDisks = linodeDiskFactory.buildList(3);

    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');

    // TODO: DC Pricing - M3-7073: Remove feature flag mocks once DC pricing is live.
    mockAppendFeatureFlags({
      dcSpecificPricing: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    // Mock request to get Linode volumes and disks
    mockGetLinodeDisks(mockLinode.id, mockLinodeDisks).as('getLinodeDisks');
    mockGetLinodeVolumes(mockLinode.id, []).as('getLinodeVolumes');

    // Mock requests to get individual types.
    mockGetLinodeType(dcPricingMockLinodeTypes[0]);
    mockGetLinodeType(dcPricingMockLinodeTypes[1]);

    cy.visitWithLogin(`/linodes/${mockLinode.id}?migrate=true`);
    cy.wait([
      '@getClientStream',
      '@getFeatureFlags',
      '@getLinode',
      '@getLinodeDisks',
      '@getLinodeVolumes',
    ]);

    ui.button.findByTitle('Enter Migration Queue').should('be.disabled');
    cy.findByText(`${initialRegion.label}`).should('be.visible');
    getClick('[data-qa-checked="false"]');

    // Confirm that user cannot select the Linode's current DC when migrating.
    cy.findByText('New Region').click().type(`${initialRegion.label}{enter}`);
    cy.findByText('No results').should('be.visible');
    // Confirm that DC pricing information does not show up
    cy.findByText(dcPricingCurrentPriceLabel).should('not.exist');
    cy.get('[data-testid="current-price-panel"]').should('not.exist');
    cy.findByText(dcPricingNewPriceLabel).should('not.exist');
    cy.get('[data-testid="new-price-panel"]').should('not.exist');
    // Change region selection to another region with the same price structure.
    cy.findByText('New Region').click().type(`${newRegion.label}{enter}`);
    // Confirm that DC pricing information still does not show up.
    cy.findByText(dcPricingCurrentPriceLabel).should('not.exist');
    cy.get('[data-testid="current-price-panel"]').should('not.exist');
    cy.findByText(dcPricingNewPriceLabel).should('not.exist');
    cy.get('[data-testid="new-price-panel"]').should('not.exist');
    // Confirm that migration queue button is enabled.
    ui.button
      .findByTitle('Enter Migration Queue')
      .should('be.visible')
      .should('be.enabled');
  });
});
