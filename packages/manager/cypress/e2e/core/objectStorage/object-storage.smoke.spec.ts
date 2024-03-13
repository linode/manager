/**
 * @file Smoke tests for crucial Object Storage operations.
 */

import 'cypress-file-upload';
import { objectStorageBucketFactory } from 'src/factories/objectStorage';
import { mockGetRegions } from 'support/intercepts/regions';
import {
  mockCreateBucket,
  mockDeleteBucket,
  mockDeleteBucketObject,
  mockDeleteBucketObjectS3,
  mockGetBuckets,
  mockGetBucketObjects,
  mockUploadBucketObject,
  mockUploadBucketObjectS3,
  mockCreateBucketError,
} from 'support/intercepts/object-storage';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { randomLabel, randomString } from 'support/util/random';
import { ui } from 'support/ui';
import { regionFactory } from 'src/factories';

describe('object storage smoke tests', () => {
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

    const mockRegionWithObj = regionFactory.build({
      label: randomLabel(),
      id: `${randomString(2)}-${randomString(3)}`,
      capabilities: ['Object Storage'],
    });

    const mockRegionsWithoutObj = regionFactory.buildList(2, {
      capabilities: [],
    });

    const mockRegions = [mockRegionWithObj, ...mockRegionsWithoutObj];

    const mockBucket = objectStorageBucketFactory.build({
      label: randomLabel(),
      region: mockRegionWithObj.id,
      cluster: undefined,
      objects: 0,
    });

    mockAppendFeatureFlags({
      objMultiCluster: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

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
        // Submit button is disabled when fields are empty.
        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .should('be.disabled');

        // Enter label.
        cy.contains('Label').click().type(mockBucket.label);

        cy.contains('Region').click().type(mockRegionWithObj.label);

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

  /*
   * - Tests core object storage bucket create flow using mocked API responses.
   * - Creates bucket.
   * - Confirms bucket is listed in table.
   */
  it('can create object storage bucket - smoke', () => {
    const bucketLabel = randomLabel();
    const bucketRegion = 'Atlanta, GA';
    const bucketCluster = 'us-southeast-1';
    const bucketHostname = `${bucketLabel}.${bucketCluster}.linodeobjects.com`;

    const mockBucket = objectStorageBucketFactory.build({
      label: bucketLabel,
      cluster: bucketCluster,
      hostname: bucketHostname,
    });

    mockAppendFeatureFlags({
      objMultiCluster: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientStream');

    mockGetBuckets([]).as('getBuckets');

    mockCreateBucket(mockBucket).as('createBucket');

    cy.visitWithLogin('/object-storage');
    cy.wait('@getBuckets');

    ui.landingPageEmptyStateResources.find().within(() => {
      cy.findByText('Getting Started Guides').should('be.visible');
      cy.findByText('Video Playlist').should('be.visible');
      cy.findByText('Create Bucket').should('be.visible').click();
    });

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        cy.findByText('Label').click().type(bucketLabel);
        ui.regionSelect.find().click().type(`${bucketRegion}{enter}`);
        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .click();
      });

    cy.wait('@createBucket');
    cy.findByText(bucketLabel).should('be.visible');
    cy.findByText(bucketRegion).should('be.visible');
    cy.findByText(bucketHostname).should('be.visible');
  });

  /*
   * - Tests core object storage upload and delete flows using mocked API responses.
   * - Uploads files in `object-storage-files` fixtures directory.
   * - Confirms uploaded files are shown in object list.
   * - Deletes uploaded files.
   * - Confirms deleted files are removed from object list.
   */
  it('can upload, view, and delete bucket objects - smoke', () => {
    const bucketLabel = randomLabel();
    const bucketCluster = 'us-southeast-1';
    const bucketContents = [
      'object-storage-files/1.txt',
      'object-storage-files/2.jpg',
      'object-storage-files/3.jpg',
      'object-storage-files/4.zip',
    ];

    mockGetBucketObjects(bucketLabel, bucketCluster, []).as('getBucketObjects');

    cy.visitWithLogin(
      `/object-storage/buckets/${bucketCluster}/${bucketLabel}`
    );
    cy.wait('@getBucketObjects');

    cy.log('Upload bucket objects');
    bucketContents.forEach((bucketFile) => {
      const filename = bucketFile.split('/')[1];

      mockUploadBucketObject(bucketLabel, bucketCluster, filename).as(
        'uploadBucketObject'
      );
      mockUploadBucketObjectS3(bucketLabel, bucketCluster, filename).as(
        'uploadBucketObjectS3'
      );
      // @TODO Intercept and mock bucket objects GET request to reflect upload.

      cy.fixture(bucketFile, null).then((bucketFileContents) => {
        cy.get('[data-qa-drop-zone="true"]').attachFile(
          {
            fileContent: bucketFileContents,
            fileName: filename,
          },
          {
            subjectType: 'drag-n-drop',
          }
        );
      });

      cy.wait(['@uploadBucketObject', '@uploadBucketObjectS3']);
    });

    cy.log('Check and delete bucket objects');
    bucketContents.forEach((bucketFile) => {
      const filename = bucketFile.split('/')[1];

      mockDeleteBucketObject(bucketLabel, bucketCluster, filename).as(
        'deleteBucketObject'
      );
      mockDeleteBucketObjectS3(bucketLabel, bucketCluster, filename).as(
        'deleteBucketObjectS3'
      );

      cy.findByLabelText('List of Bucket Objects').within(() => {
        cy.findByText(filename)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText('Delete').click();
          });
      });

      ui.dialog.findByTitle(`Delete ${filename}`).should('be.visible');

      ui.buttonGroup
        .findButtonByTitle('Delete')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait(['@deleteBucketObject', '@deleteBucketObjectS3']);
    });

    cy.findByText('This bucket is empty.').should('be.visible');
  });

  /*
   * - Tests core object storage bucket deletion flow using mocked API responses.
   * - Mocks existing buckets.
   * - Deletes mocked bucket, confirms that landing page reflects deletion.
   */
  it('can delete object storage bucket - smoke', () => {
    const bucketLabel = randomLabel();
    const bucketCluster = 'us-southeast-1';
    const bucketMock = objectStorageBucketFactory.build({
      label: bucketLabel,
      cluster: bucketCluster,
      hostname: `${bucketLabel}.${bucketCluster}.linodeobjects.com`,
      objects: 0,
    });

    mockGetBuckets([bucketMock]).as('getBuckets');
    mockDeleteBucket(bucketLabel, bucketCluster).as('deleteBucket');

    cy.visitWithLogin('/object-storage');
    cy.wait('@getBuckets');

    cy.findByText(bucketLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Delete').should('be.visible').click();
      });

    ui.dialog
      .findByTitle(`Delete Bucket ${bucketLabel}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Bucket Name').click().type(bucketLabel);
        ui.buttonGroup
          .findButtonByTitle('Delete')
          .should('be.enabled')
          .should('be.visible')
          .click();
      });

    cy.wait('@deleteBucket');
    cy.findByText('S3-compatible storage solution').should('be.visible');
  });
});
