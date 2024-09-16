import { ui } from 'support/ui';
import { accountFactory, regionFactory } from '@src/factories';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import {
  checkboxTestId,
  headerTestId,
} from 'src/components/Encryption/Encryption';

describe('Create Linode with Disk Encryption', () => {
  it('should not have a "Disk Encryption" section visible if the feature flag is off and user does not have capability', () => {
    // Mock feature flag -- @TODO LDE: Remove feature flag once LDE is fully rolled out
    mockAppendFeatureFlags({
      linodeDiskEncryption: makeFeatureFlagData(false),
    }).as('getFeatureFlags');

    // Mock account response
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes'],
    });

    mockGetAccount(mockAccount).as('getAccount');

    // intercept request
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getAccount']);

    // Check if section is visible
    cy.get(`[data-testid=${headerTestId}]`).should('not.exist');
  });

  it('should have a "Disk Encryption" section visible if feature flag is on and user has the capability', () => {
    // Mock feature flag -- @TODO LDE: Remove feature flag once LDE is fully rolled out
    mockAppendFeatureFlags({
      linodeDiskEncryption: makeFeatureFlagData(true),
    }).as('getFeatureFlags');

    // Mock account response
    const mockAccount = accountFactory.build({
      capabilities: ['Linodes', 'Disk Encryption'],
    });

    const mockRegion = regionFactory.build({
      capabilities: ['Linodes', 'Disk Encryption'],
    });

    const mockRegionWithoutDiskEncryption = regionFactory.build({
      capabilities: ['Linodes'],
    });

    const mockRegions = [mockRegion, mockRegionWithoutDiskEncryption];

    mockGetAccount(mockAccount).as('getAccount');
    mockGetRegions(mockRegions);

    // intercept request
    cy.visitWithLogin('/linodes/create');
    cy.wait(['@getFeatureFlags', '@getAccount']);

    // Check if section is visible
    cy.get(`[data-testid="${headerTestId}"]`).should('exist');

    // "Encrypt Disk" checkbox should be disabled if a region that does not support LDE is selected
    ui.regionSelect.find().click();
    ui.select
      .findItemByText(
        `${mockRegionWithoutDiskEncryption.label} (${mockRegionWithoutDiskEncryption.id})`
      )
      .click();

    cy.get(`[data-testid="${checkboxTestId}"]`).should('be.disabled');

    ui.regionSelect.find().click();
    ui.select.findItemByText(`${mockRegion.label} (${mockRegion.id})`).click();

    cy.get(`[data-testid="${checkboxTestId}"]`).should('be.enabled');
  });
});
