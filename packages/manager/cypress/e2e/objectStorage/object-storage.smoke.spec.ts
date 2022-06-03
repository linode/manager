/**
 * @file Smoke tests for crucial Object Storage operations.
 */

import 'cypress-file-upload';
import { objectStorageBucketFactory } from 'src/factories/objectStorage';
import {
  mockCreateBucket,
  mockDeleteBucket,
  mockDeleteBucketObject,
  mockDeleteBucketObjectS3,
  mockGetBuckets,
  mockGetBucketObjects,
  mockUploadBucketObject,
  mockUploadBucketObjectS3,
} from 'support/intercepts/object-storage';
import { randomLabel } from 'support/util/random';
import { ui } from 'support/ui';

describe('object storage smoke tests', () => {
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

    mockGetBuckets([]).as('getBuckets');
    mockCreateBucket(bucketLabel, bucketCluster).as('createBucket');

    cy.visitWithLogin('/object-storage');
    cy.wait('@getBuckets');

    ui.entityHeader.find().within(() => {
      cy.findByText('Create Bucket').should('be.visible').click();
    });

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        cy.findByText('Label').click().type(bucketLabel);
        cy.findByText('Region').click().type(`${bucketRegion}{enter}`);
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

    mockGetBuckets(bucketMock).as('getBuckets');
    mockDeleteBucket(bucketLabel, bucketCluster).as('deleteBucket');

    cy.visitWithLogin('/object-storage');
    cy.wait('@getBuckets');

    cy.findByText(bucketLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Delete').should('be.visible').click();
      });

    ui.dialog.findByTitle(`Delete Bucket ${bucketLabel}`).should('be.visible');
    cy.findByLabelText('Bucket Name').click().type(bucketLabel);
    ui.buttonGroup
      .findButtonByTitle('Delete Bucket')
      .should('be.enabled')
      .should('be.visible')
      .click();

    cy.wait('@deleteBucket');
    cy.findByText('Need help getting started?').should('be.visible');
  });
});
