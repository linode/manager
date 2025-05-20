/**
 * @file Smoke tests for crucial Object Storage operations.
 */

import 'cypress-file-upload';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateBucket,
  mockDeleteBucket,
  mockDeleteBucketObject,
  mockDeleteBucketObjectS3,
  mockGetBucketObjects,
  mockGetBuckets,
  mockUploadBucketObject,
  mockUploadBucketObjectS3,
} from 'support/intercepts/object-storage';
import { ui } from 'support/ui';
import { chooseCluster } from 'support/util/clusters';
import { randomLabel } from 'support/util/random';
import { getRegionById } from 'support/util/regions';

import { accountFactory } from 'src/factories';
import { objectStorageBucketFactory } from 'src/factories/objectStorage';
describe('object storage smoke tests', () => {
  /*
   * - Tests core object storage bucket create flow using mocked API responses.
   * - Creates bucket.
   * - Confirms bucket is listed in table.
   */
  it('can create object storage bucket - smoke', () => {
    const mockCluster = chooseCluster();
    const bucketLabel = randomLabel();
    const mockRegion = getRegionById(mockCluster.region);
    const bucketHostname = `${bucketLabel}.${mockCluster.id}.linodeobjects.com`;
    const mockBucket = objectStorageBucketFactory.build({
      cluster: mockCluster.id,
      hostname: bucketHostname,
      label: bucketLabel,
      region: mockCluster.region,
    });
    mockGetAccount(accountFactory.build({ capabilities: ['Object Storage'] }));
    mockAppendFeatureFlags({
      gecko2: false,
      objMultiCluster: false,
      objectStorageGen2: { enabled: false },
    }).as('getFeatureFlags');

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
        cy.findByLabelText('Bucket Name (required)').click();
        cy.focused().type(bucketLabel);
        ui.regionSelect.find().click();
        cy.focused().type(`${mockCluster.id}{enter}`);
        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .click();
      });

    cy.wait('@createBucket');
    cy.findByText(bucketLabel).should('be.visible');
    cy.findByText(mockRegion.label).should('be.visible');
    cy.findByText(mockBucket.hostname).should('be.visible');
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
      cluster: bucketCluster,
      hostname: `${bucketLabel}.${bucketCluster}.linodeobjects.com`,
      label: bucketLabel,
      objects: 0,
    });

    mockGetAccount(accountFactory.build({ capabilities: ['Object Storage'] }));
    mockAppendFeatureFlags({
      objMultiCluster: false,
      objectStorageGen2: { enabled: false },
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
        cy.findByLabelText('Bucket Name').click();
        cy.focused().type(bucketLabel);
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
