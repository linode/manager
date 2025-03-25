import { regionFactory } from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateAccessKey,
  mockGetAccessKeys,
  mockGetBucketsForRegion,
  mockUpdateAccessKey,
} from 'support/intercepts/object-storage';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { buildArray } from 'support/util/arrays';
import {
  randomDomainName,
  randomLabel,
  randomNumber,
  randomString,
} from 'support/util/random';
import { extendRegion } from 'support/util/regions';

import {
  accountFactory,
  objectStorageBucketFactory,
  objectStorageKeyFactory,
} from 'src/factories';

import type { ObjectStorageKeyBucketAccess } from '@linode/api-v4';

describe('Object Storage Multicluster access keys', () => {
  const mockRegionsObj = buildArray(3, () => {
    return extendRegion(
      regionFactory.build({
        capabilities: ['Object Storage'],
        id: `us-${randomString(5)}`,
        label: `mock-obj-region-${randomString(5)}`,
      })
    );
  });

  const mockRegions = [...mockRegionsObj];

  beforeEach(() => {
    mockGetAccount(
      accountFactory.build({
        capabilities: ['Object Storage', 'Object Storage Access Key Regions'],
      })
    );
    mockAppendFeatureFlags({
      objMultiCluster: true,
      objectStorageGen2: { enabled: false },
    });
  });

  /*
   * - Confirms user can create access keys with unlimited access when OBJ Multicluster is enabled.
   * - Confirms multiple regions can be selected when creating an access key.
   * - Confirms that UI updates to reflect created access key.
   */
  it('can create unlimited access keys with OBJ Multicluster', () => {
    const mockAccessKey = objectStorageKeyFactory.build({
      access_key: randomString(20),
      id: randomNumber(10000, 99999),
      label: randomLabel(),
      regions: mockRegionsObj.map((mockObjRegion) => ({
        id: mockObjRegion.id,
        s3_endpoint: randomDomainName(),
      })),
      secret_key: randomString(39),
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
        cy.contains('Label (required)').should('be.visible').click();
        cy.focused().type(mockAccessKey.label);

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
        cy.contains('Regions (required)').should('be.visible').click();
        cy.focused().type('{esc}');

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
   * - Confirms user can create access keys with limited access when OBJ Multicluster is enabled.
   * - Confirms that UI updates to reflect created access key.
   * - Confirms that "Permissions" drawer contains expected scope and permission data.
   */
  it('can create limited access keys with OBJ Multicluster', () => {
    const mockRegion = extendRegion(
      regionFactory.build({
        capabilities: ['Object Storage'],
        id: `us-${randomString(5)}`,
        label: `mock-obj-region-${randomString(5)}`,
      })
    );

    const mockBuckets = objectStorageBucketFactory.buildList(2, {
      cluster: undefined,
      region: mockRegion.id,
    });

    const mockAccessKey = objectStorageKeyFactory.build({
      access_key: randomString(20),
      bucket_access: mockBuckets.map(
        (bucket): ObjectStorageKeyBucketAccess => ({
          bucket_name: bucket.label,
          cluster: '',
          permissions: 'read_only',
          region: mockRegion.id,
        })
      ),
      id: randomNumber(10000, 99999),
      label: randomLabel(),
      limited: true,
      regions: [
        {
          id: mockRegion.id,
          s3_endpoint: randomDomainName(),
        },
      ],
      secret_key: randomString(39),
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
        cy.contains('Label (required)').should('be.visible').click();
        cy.focused().type(mockAccessKey.label);

        cy.contains('Regions (required)').should('be.visible').click();
        cy.focused().type(`${mockRegion.label}{enter}`);

        ui.autocompletePopper
          .findByTitle(`${mockRegion.label} (${mockRegion.id})`)
          .should('be.visible');

        // Dismiss region drop-down.
        cy.contains('Regions (required)').should('be.visible').click();
        cy.focused().type('{esc}');

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
    const mockInitialRegion = extendRegion(
      regionFactory.build({
        capabilities: ['Object Storage'],
        id: `us-${randomString(5)}`,
        label: `mock-obj-region-${randomString(5)}`,
      })
    );

    const mockUpdatedRegion = extendRegion(
      regionFactory.build({
        capabilities: ['Object Storage'],
        id: `us-${randomString(5)}`,
        label: `mock-obj-region-${randomString(5)}`,
      })
    );

    const mockRegions = [mockInitialRegion, mockUpdatedRegion];

    const mockAccessKey = objectStorageKeyFactory.build({
      access_key: randomString(20),
      id: randomNumber(10000, 99999),
      label: randomLabel(),
      regions: [
        {
          id: mockInitialRegion.id,
          s3_endpoint: randomDomainName(),
        },
      ],
      secret_key: randomString(39),
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
        cy.contains('Label (required)').should('be.visible').click();
        cy.focused().type('{selectall}{backspace}');
        cy.focused().type(mockUpdatedAccessKey.label);

        cy.contains('Regions (required)').should('be.visible').click();
        cy.focused().type(`${mockUpdatedRegion.label}{enter}{esc}`);

        cy.contains(mockUpdatedRegion.label).should('be.visible').and('exist');

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
