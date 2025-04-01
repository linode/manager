import {
  linodeFactory,
  linodeTypeFactory,
  regionFactory,
} from '@linode/utilities';
import { accountFactory } from '@src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateLinode,
  mockGetLinodeTypes,
} from 'support/intercepts/linodes';
import {
  mockGetRegionAvailability,
  mockGetRegions,
} from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { randomLabel, randomString } from 'support/util/random';
import { extendRegion } from 'support/util/regions';

import {
  checkboxTestId,
  headerTestId,
} from 'src/components/Encryption/constants';

import type { Region } from '@linode/api-v4';

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
    ui.regionSelect
      .findItemByRegionLabel(mockRegionWithoutDiskEncryption.label, mockRegions)
      .click();

    cy.get(`[data-testid="${checkboxTestId}"]`).should('be.disabled');

    ui.regionSelect.find().click();
    ui.regionSelect
      .findItemByRegionLabel(mockRegion.label, mockRegions)
      .click();

    cy.get(`[data-testid="${checkboxTestId}"]`).should('be.enabled');
  });

  // Confirm Linode Disk Encryption features when using Distributed Regions.
  describe('Distributed regions', () => {
    const encryptionTooltipMessage =
      'Distributed Compute Instances are encrypted. This setting can not be changed.';

    const mockDistributedRegionWithoutCapability = regionFactory.build({
      capabilities: [
        'Linodes',
        'Cloud Firewall',
        'Distributed Plans',
        'Placement Group',
      ],
      site_type: 'distributed',
    });

    const mockDistributedRegionWithCapability = regionFactory.build({
      capabilities: [
        'Linodes',
        'Cloud Firewall',
        'Distributed Plans',
        'Placement Group',
        'Disk Encryption',
      ],
      site_type: 'distributed',
    });

    const mockDistributedRegions: Region[] = [
      mockDistributedRegionWithCapability,
      mockDistributedRegionWithoutCapability,
    ];

    const mockLinodeType = linodeTypeFactory.build({
      class: 'nanode',
      id: 'nanode-edge-1',
      label: 'Nanode 1GB',
    });

    /*
     * Right now there's some ambiguity over the 'Disk Encryption' capability
     * and whether it's expected to be present for Distributed Regions. We'll
     * test Cloud against both scenarios -- when distributed regions do and do
     * not have the capability -- and confirm that the Linode Create flow works
     * as expected in both cases.
     */
    mockDistributedRegions.forEach((distributedRegion) => {
      const suffix = distributedRegion.capabilities.includes('Disk Encryption')
        ? '(with region capability)'
        : '(without region capability)';

      /*
       * - Confirms that disk encryption works as expected for distributed regions. Specifically:
       * - Encrypted checkbox is always checked, is disabled, and therefore cannot be changed.
       * - Outgoing Linode create API request payload does NOT contain encryption property.
       */
      it(`creates a Linode with Disk Encryption in a distributed region ${suffix}`, () => {
        const mockRegions = [distributedRegion];
        const mockLinode = linodeFactory.build({
          label: randomLabel(),
          region: distributedRegion.id,
        });

        mockAppendFeatureFlags({
          gecko2: {
            enabled: true,
          },
        });

        mockGetRegions(mockRegions);
        mockGetLinodeTypes([mockLinodeType]);
        mockGetRegionAvailability(distributedRegion.id, []);
        mockCreateLinode(mockLinode).as('createLinode');
        cy.visitWithLogin('/linodes/create');

        cy.get('[data-qa-linode-region]').within(() => {
          ui.tabList.find().within(() => {
            cy.findByText('Distributed').click();
          });

          cy.findByLabelText('Region').type(distributedRegion.label);
          ui.regionSelect
            .findItemByRegionLabel(
              extendRegion(distributedRegion).label,
              mockRegions
            )
            .click();
        });

        linodeCreatePage.setLabel(mockLinode.label);
        linodeCreatePage.setRootPassword(randomString(32));

        // Select mock Nanode plan type.
        cy.get('[data-qa-plan-row="Nanode 1 GB"]').click();

        cy.findByLabelText('Encrypt Disk')
          .should('be.disabled')
          .should('be.checked');

        cy.findByLabelText(encryptionTooltipMessage).click();
        ui.tooltip.findByText(encryptionTooltipMessage).should('be.visible');

        // Click "Create Linode" and confirm outgoing API request payload.
        ui.button
          .findByTitle('Create Linode')
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Submit form to create Linode and confirm that outgoing API request
        // contains expected user data.
        cy.wait('@createLinode').then((xhr) => {
          const requestPayload = xhr.request.body;
          const regionId = requestPayload['region'];
          expect(regionId).to.equal(mockLinode.region);
          expect(requestPayload['disk_encryption']).should('be.undefined');
        });
      });
    });
  });
});
