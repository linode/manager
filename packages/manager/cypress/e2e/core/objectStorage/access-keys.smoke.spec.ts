/**
 * @file Smoke tests for crucial Object Storage Access Keys operations.
 */

import {
  objectStorageKeyFactory,
  objectStorageBucketFactory,
} from 'src/factories/objectStorage';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import {
  mockCreateAccessKey,
  mockDeleteAccessKey,
  mockGetAccessKeys,
  mockGetBucketsForRegion,
  mockUpdateAccessKey,
} from 'support/intercepts/object-storage';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import {
  randomDomainName,
  randomLabel,
  randomNumber,
  randomString,
} from 'support/util/random';
import { ui } from 'support/ui';
import { regionFactory } from 'src/factories';
import { mockGetRegions } from 'support/intercepts/regions';
import { buildArray } from 'support/util/arrays';
import { Scope } from '@linode/api-v4';

describe('object storage access keys smoke tests', () => {
  /*
   * - Tests core object storage key create flow using mocked API responses.
   * - Creates access key.
   * - Confirms access key and secret are displayed.
   * - Confirms access key is listed in table.
   */
  it('can create access key - smoke', () => {
    const mockAccessKey = objectStorageKeyFactory.build({
      label: randomLabel(),
      access_key: randomString(20),
      secret_key: randomString(39),
    });

    mockAppendFeatureFlags({
      objMultiCluster: makeFeatureFlagData(false),
    });
    mockGetFeatureFlagClientstream();

    mockGetAccessKeys([]).as('getKeys');
    mockCreateAccessKey(mockAccessKey).as('createKey');

    cy.visitWithLogin('object-storage/access-keys');
    cy.wait('@getKeys');

    cy.findByText('No items to display.').should('be.visible');

    ui.entityHeader.find().within(() => {
      cy.findByText('Create Access Key').should('be.visible').click();
    });

    mockGetAccessKeys([mockAccessKey]).as('getKeys');
    ui.drawer
      .findByTitle('Create Access Key')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label').click().type(mockAccessKey.label);
        ui.buttonGroup
          .findButtonByTitle('Create Access Key')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@createKey', '@getKeys']);

    ui.dialog
      .findByTitle('Access Keys')
      .should('be.visible')
      .within(() => {
        cy.get('input[id="access-key"]')
          .should('be.visible')
          .should('have.value', mockAccessKey.access_key);
        cy.get('input[id="secret-key"]')
          .should('be.visible')
          .should('have.value', mockAccessKey.secret_key);

        ui.buttonGroup
          .findButtonByTitle('I Have Saved My Secret Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.findByLabelText('List of Object Storage Access Keys').within(() => {
      cy.findByText(mockAccessKey.label).should('be.visible');
      cy.findByText(mockAccessKey.access_key).should('be.visible');
    });
  });

  /*
   * - Tests core object storage key revoke flow using mocked API responses.
   * - Confirms access key is listed in table.
   * - Revokes access key.
   * - Confirms access key is no longer listed in table.
   */
  it('can revoke access key - smoke', () => {
    const accessKey = objectStorageKeyFactory.build({
      label: randomLabel(),
      id: randomNumber(1, 99999),
      access_key: randomString(20),
      secret_key: randomString(39),
    });

    mockAppendFeatureFlags({
      objMultiCluster: makeFeatureFlagData(false),
    });
    mockGetFeatureFlagClientstream();

    // Mock initial GET request to include an access key.
    mockGetAccessKeys([accessKey]).as('getKeys');
    mockDeleteAccessKey(accessKey.id).as('deleteKey');

    cy.visitWithLogin('/object-storage/access-keys');
    cy.wait('@getKeys');

    cy.findByLabelText('List of Object Storage Access Keys').within(() => {
      cy.findByText(accessKey.label).should('be.visible');
      cy.findByText(accessKey.access_key).should('be.visible');
      cy.findByText('Revoke').should('be.visible').click();
    });

    // Mock next GET request to respond with no data to reflect key revocation.
    mockGetAccessKeys([]).as('getKeys');

    ui.dialog.findByTitle(`Revoking ${accessKey.label}`).within(() => {
      ui.buttonGroup
        .findButtonByTitle('Revoke')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.wait(['@deleteKey', '@getKeys']);
    cy.findByText('No items to display.').should('be.visible');
  });

  describe('Object Storage Multicluster feature enabled', () => {
    const mockRegionsObj = buildArray(3, () => {
      return regionFactory.build({
        id: `us-${randomString(5)}`,
        label: `mock-obj-region-${randomString(5)}`,
        capabilities: ['Object Storage'],
      });
    });

    const mockRegionsNoObj = regionFactory.buildList(3, {
      capabilities: [],
    });

    const mockRegions = [...mockRegionsObj, ...mockRegionsNoObj];

    beforeEach(() => {
      mockAppendFeatureFlags({
        objMultiCluster: makeFeatureFlagData(true),
      });
      mockGetFeatureFlagClientstream();
    });

    /*
     * - Confirms user can create access keys with unlimited access when OBJ Multicluster is enabled.
     * - Confirms multiple regions can be selected when creating an access key.
     * - Confirms that UI updates to reflect created access key.
     */
    it('can create unlimited access keys with OBJ Multicluster', () => {
      const mockAccessKey = objectStorageKeyFactory.build({
        id: randomNumber(10000, 99999),
        label: randomLabel(),
        access_key: randomString(20),
        secret_key: randomString(39),
        regions: mockRegionsObj.map((mockObjRegion) => ({
          id: mockObjRegion.id,
          s3_endpoint: randomDomainName(),
        })),
      });

      mockGetAccessKeys([]);
      mockCreateAccessKey(mockAccessKey).as('createAccessKey');
      mockGetRegions(mockRegions);
      mockRegions.forEach((region) => {
        mockGetBucketsForRegion(region.id, []);
      });

      cy.visitWithLogin('/object-storage/access-keys');

      ui.button
        .findByTitle('Create Access Key')
        .should('be.visible')
        .should('be.enabled')
        .click();

      mockGetAccessKeys([mockAccessKey]);
      ui.drawer
        .findByTitle('Create Access Key')
        .should('be.visible')
        .within(() => {
          cy.contains('Label (required)')
            .should('be.visible')
            .click()
            .type(mockAccessKey.label);

          cy.contains('Regions (required)').should('be.visible').click();

          // Select each region with the OBJ capability.
          mockRegionsObj.forEach((mockRegion) => {
            cy.contains('Regions (required)').type(mockRegion.label);
            ui.autocompletePopper
              .findByTitle(`${mockRegion.label} (${mockRegion.id})`)
              .should('be.visible')
              .click();
          });

          // Close the regions drop-down.
          cy.contains('Regions (required)')
            .should('be.visible')
            .click()
            .type('{esc}');

          // TODO Confirm expected regions are shown.
          ui.buttonGroup
            .findButtonByTitle('Create Access Key')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@createAccessKey');
      ui.dialog
        .findByTitle('Access Keys')
        .should('be.visible')
        .within(() => {
          // TODO Add assertions for S3 hostnames
          cy.get('input[id="access-key"]')
            .should('be.visible')
            .should('have.value', mockAccessKey.access_key);
          cy.get('input[id="secret-key"]')
            .should('be.visible')
            .should('have.value', mockAccessKey.secret_key);

          ui.button
            .findByTitle('I Have Saved My Secret Key')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.findByText(mockAccessKey.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          // TODO Add assertions for regions/S3 hostnames
          cy.findByText(mockAccessKey.access_key).should('be.visible');
        });
    });

    /*
     * - COnfirms user can create access keys with limited access when OBJ Multicluster is enabled.
     * - Confirms that UI updates to reflect created access key.
     * - Confirms that "Permissions" drawer contains expected scope and permission data.
     */
    it('can create limited access keys with OBJ Multicluster', () => {
      const mockRegion = regionFactory.build({
        id: `us-${randomString(5)}`,
        label: `mock-obj-region-${randomString(5)}`,
        capabilities: ['Object Storage'],
      });

      const mockBuckets = objectStorageBucketFactory.buildList(2, {
        region: mockRegion.id,
        cluster: undefined,
      });

      const mockAccessKey = objectStorageKeyFactory.build({
        id: randomNumber(10000, 99999),
        label: randomLabel(),
        access_key: randomString(20),
        secret_key: randomString(39),
        regions: [
          {
            id: mockRegion.id,
            s3_endpoint: randomDomainName(),
          },
        ],
        limited: true,
        bucket_access: mockBuckets.map(
          (bucket): Scope => ({
            bucket_name: bucket.label,
            cluster: '',
            permissions: 'read_only',
            region: mockRegion.id,
          })
        ),
      });

      mockGetAccessKeys([]);
      mockCreateAccessKey(mockAccessKey).as('createAccessKey');
      mockGetRegions([mockRegion]);
      mockGetBucketsForRegion(mockRegion.id, mockBuckets);

      // Navigate to access keys page, click "Create Access Key" button.
      cy.visitWithLogin('/object-storage/access-keys');
      ui.button
        .findByTitle('Create Access Key')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Fill out form in "Create Access Key" drawer.
      ui.drawer
        .findByTitle('Create Access Key')
        .should('be.visible')
        .within(() => {
          cy.contains('Label (required)')
            .should('be.visible')
            .click()
            .type(mockAccessKey.label);

          cy.contains('Regions (required)')
            .should('be.visible')
            .click()
            .type(`${mockRegion.label}{enter}`);

          ui.autocompletePopper
            .findByTitle(`${mockRegion.label} (${mockRegion.id})`)
            .should('be.visible');

          // Dismiss region drop-down.
          cy.contains('Regions (required)')
            .should('be.visible')
            .click()
            .type('{esc}');

          // Enable "Limited Access" toggle for access key and confirm Create button is disabled.
          cy.findByText('Limited Access').should('be.visible').click();

          ui.buttonGroup
            .findButtonByTitle('Create Access Key')
            .should('be.disabled');

          // Select access rules for all buckets to enable Create button.
          mockBuckets.forEach((mockBucket) => {
            cy.findByText(mockBucket.label)
              .should('be.visible')
              .closest('tr')
              .within(() => {
                cy.findByLabelText(
                  `read-only for ${mockRegion.id}-${mockBucket.label}`
                )
                  .should('be.enabled')
                  .click();
              });
          });

          mockGetAccessKeys([mockAccessKey]);
          ui.buttonGroup
            .findButtonByTitle('Create Access Key')
            .should('be.enabled')
            .click();
        });

      // Dismiss secrets dialog.
      cy.wait('@createAccessKey');
      ui.buttonGroup
        .findButtonByTitle('I Have Saved My Secret Key')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Open "Permissions" drawer for new access key.
      cy.findByText(mockAccessKey.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          ui.actionMenu
            .findByTitle(
              `Action menu for Object Storage Key ${mockAccessKey.label}`
            )
            .should('be.visible')
            .click();
        });

      ui.actionMenuItem.findByTitle('Permissions').click();
      ui.drawer
        .findByTitle(`Permissions for ${mockAccessKey.label}`)
        .should('be.visible')
        .within(() => {
          mockBuckets.forEach((mockBucket) => {
            // TODO M3-7733 Update this selector when ARIA label is fixed.
            cy.findByLabelText(
              `This token has read-only access for ${mockRegion.id}-${mockBucket.label}`
            );
          });
        });
    });

    /*
     * - Confirms user can edit access key labels and regions when OBJ Multicluster is enabled.
     * - Confirms that user can deselect regions via the region selection list.
     * - Confirms that access keys landing page automatically updates to reflect edited access key.
     */
    it('can update access keys with OBJ Multicluster', () => {
      const mockInitialRegion = regionFactory.build({
        id: `us-${randomString(5)}`,
        label: `mock-obj-region-${randomString(5)}`,
        capabilities: ['Object Storage'],
      });

      const mockUpdatedRegion = regionFactory.build({
        id: `us-${randomString(5)}`,
        label: `mock-obj-region-${randomString(5)}`,
        capabilities: ['Object Storage'],
      });

      const mockRegions = [mockInitialRegion, mockUpdatedRegion];

      const mockAccessKey = objectStorageKeyFactory.build({
        id: randomNumber(10000, 99999),
        label: randomLabel(),
        access_key: randomString(20),
        secret_key: randomString(39),
        regions: [
          {
            id: mockInitialRegion.id,
            s3_endpoint: randomDomainName(),
          },
        ],
      });

      const mockUpdatedAccessKeyEndpoint = randomDomainName();

      const mockUpdatedAccessKey = {
        ...mockAccessKey,
        label: randomLabel(),
        regions: [
          {
            id: mockUpdatedRegion.id,
            s3_endpoint: mockUpdatedAccessKeyEndpoint,
          },
        ],
      };

      mockGetAccessKeys([mockAccessKey]);
      mockGetRegions(mockRegions);
      cy.visitWithLogin('/object-storage/access-keys');

      cy.findByText(mockAccessKey.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          ui.actionMenu
            .findByTitle(
              `Action menu for Object Storage Key ${mockAccessKey.label}`
            )
            .should('be.visible')
            .click();
        });

      ui.actionMenuItem
        .findByTitle('Edit')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer
        .findByTitle('Edit Access Key')
        .should('be.visible')
        .within(() => {
          cy.contains('Label (required)')
            .should('be.visible')
            .click()
            .type('{selectall}{backspace}')
            .type(mockUpdatedAccessKey.label);

          cy.contains('Regions (required)')
            .should('be.visible')
            .click()
            .type(`${mockUpdatedRegion.label}{enter}{esc}`);

          cy.contains(mockUpdatedRegion.label)
            .should('be.visible')
            .and('exist');

          // Directly find the close button within the chip
          cy.findByTestId(`${mockUpdatedRegion.id}`)
            .findByTestId('CloseIcon')
            .click();

          mockUpdateAccessKey(mockUpdatedAccessKey).as('updateAccessKey');
          mockGetAccessKeys([mockUpdatedAccessKey]);
          ui.button
            .findByTitle('Save Changes')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@updateAccessKey');

      // Confirm that access key landing page reflects updated key.
      cy.findByText(mockAccessKey.label).should('not.exist');
      cy.findByText(mockUpdatedAccessKey.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.contains(mockUpdatedRegion.label).should('be.visible');
          cy.contains(mockUpdatedAccessKeyEndpoint).should('be.visible');
        });
    });
  });
});
