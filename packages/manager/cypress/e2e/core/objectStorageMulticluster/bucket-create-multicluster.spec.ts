import { extendRegion } from 'support/util/regions';
import {
  accountFactory,
  regionFactory,
  objectStorageBucketFactory,
} from 'src/factories';
import { randomLabel, randomString } from 'support/util/random';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetRegions } from 'support/intercepts/regions';
import {
  mockCreateBucket,
  mockCreateBucketError,
  mockGetBuckets,
} from 'support/intercepts/object-storage';
import { ui } from 'support/ui';

describe('Object Storage Multicluster Bucket create', () => {
  /*
   * - Tests Object Storage bucket creation flow when OBJ Multicluster is enabled.
   * - Confirms that expected regions are displayed in drop-down.
   * - Confirms that region can be selected during create.
   * - Confirms that API errors are handled gracefully by drawer.
   * - Confirms that request payload contains desired Bucket region and not cluster.
   * - Confirms that created Bucket is listed on the landing page.
   */
  it('can create object storage bucket with OBJ Multicluster', () => {
    const mockErrorMessage = 'An unknown error has occurred.';

    const mockRegionWithObj = extendRegion(
      regionFactory.build({
        label: randomLabel(),
        id: `${randomString(2)}-${randomString(3)}`,
        capabilities: ['Object Storage'],
      })
    );

    const mockRegionsWithoutObj = regionFactory
      .buildList(2, {
        capabilities: [],
      })
      .map((region) => extendRegion(region));

    const mockRegions = [mockRegionWithObj, ...mockRegionsWithoutObj];

    const mockBucket = objectStorageBucketFactory.build({
      label: randomLabel(),
      region: mockRegionWithObj.id,
      cluster: undefined,
      objects: 0,
    });

    mockGetAccount(
      accountFactory.build({
        capabilities: ['Object Storage', 'Object Storage Access Key Regions'],
      })
    );
    mockAppendFeatureFlags({
      objMultiCluster: true,
      objectStorageGen2: { enabled: false },
    }).as('getFeatureFlags');

    mockGetRegions(mockRegions).as('getRegions');
    mockGetBuckets([]).as('getBuckets');
    mockCreateBucketError(mockErrorMessage).as('createBucket');

    cy.visitWithLogin('/object-storage');
    cy.wait(['@getRegions', '@getBuckets']);

    ui.entityHeader.find().within(() => {
      ui.button.findByTitle('Create Bucket').should('be.visible').click();
    });

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        // Enter label.
        cy.contains('Label').click();
        cy.focused().type(mockBucket.label);
        cy.log(`${mockRegionWithObj.label}`);
        cy.contains('Region').click();
        cy.focused().type(mockRegionWithObj.label);

        ui.autocompletePopper
          .find()
          .should('be.visible')
          .within(() => {
            // Confirm that regions without 'Object Storage' capability are not listed.
            mockRegionsWithoutObj.forEach((mockRegionWithoutObj) => {
              cy.contains(mockRegionWithoutObj.id).should('not.exist');
            });

            // Confirm that region with 'Object Storage' capability is listed,
            // then select it.
            cy.findByText(
              `${mockRegionWithObj.label} (${mockRegionWithObj.id})`
            )
              .should('be.visible')
              .click();
          });

        // Close region select.
        cy.contains('Region').click();

        // On first attempt, mock an error response and confirm message is shown.
        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .click();

        cy.wait('@createBucket');
        cy.findByText(mockErrorMessage).should('be.visible');

        // Click submit again, mock a successful response.
        mockCreateBucket(mockBucket).as('createBucket');
        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .click();
      });

    // Confirm that Cloud includes the "region" property and omits the "cluster"
    // property in its payload when creating a bucket.
    cy.wait('@createBucket').then((xhr) => {
      const body = xhr.request.body;
      expect(body.cluster).to.be.undefined;
      expect(body.region).to.eq(mockRegionWithObj.id);
    });

    cy.findByText(mockBucket.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        // TODO Confirm that bucket region is shown in landing page.
        cy.findByText(mockBucket.hostname).should('be.visible');
        // cy.findByText(mockRegionWithObj.label).should('be.visible');
      });
  });
});
