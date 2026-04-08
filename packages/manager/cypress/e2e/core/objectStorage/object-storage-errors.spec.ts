/**
 * @file Integration tests for Cloud Manager Object Storage failure paths.
 */

import 'cypress-file-upload';
import {
  mockGetBucketObjects,
  mockGetBuckets,
  mockUploadBucketObject,
} from 'support/intercepts/object-storage';
import { makeError } from 'support/util/errors';
import { randomItem, randomLabel, randomString } from 'support/util/random';

import { objectStorageBucketFactory } from 'src/factories';

describe('object storage failure paths', () => {
  /*
   * - Tests error UI when an object upload fails.
   * - Initiates object upload, mocks API 404 error response.
   * - Confirms that error is displayed.
   */
  it('shows error upon object upload failure', () => {
    const bucketLabel = randomLabel();
    const bucketRegion = 'us-southeast';
    const bucketMock = objectStorageBucketFactory.build({
      region: bucketRegion,
      hostname: `${bucketLabel}.${bucketRegion}-1.linodeobjects.com`,
      label: bucketLabel,
      objects: 0,
    });
    const bucketFile = randomItem([
      'object-storage-files/1.txt',
      'object-storage-files/2.jpg',
      'object-storage-files/3.jpg',
      'object-storage-files/4.zip',
    ]);

    const bucketFilename = bucketFile.split('/')[1];

    // Mock empty object list and failed object-url upload request.
    mockGetBuckets([bucketMock]).as('getBuckets');
    mockGetBucketObjects(bucketLabel, bucketRegion, []).as('getBucketObjects');
    mockUploadBucketObject(
      bucketLabel,
      bucketRegion,
      bucketFilename,
      makeError(randomString()),
      404
    ).as('uploadBucketObject');

    // Visit bucket details page, initiate object upload.
    cy.visitWithLogin(`/object-storage/buckets/${bucketRegion}/${bucketLabel}`);
    cy.wait('@getBucketObjects');

    cy.fixture(bucketFile, null).then((bucketFileContents) => {
      cy.get('[data-qa-drop-zone="true"]').attachFile(
        {
          fileContent: bucketFileContents,
          fileName: bucketFilename,
        },
        {
          subjectType: 'drag-n-drop',
        }
      );
    });

    // Confirm that error indicator appears, and that error tooltip is shown upon hover.
    cy.wait(['@uploadBucketObject']);
    cy.get('[data-qa-file-upload-error]').should('be.visible');
    cy.findByText(bucketFilename).should('be.visible').trigger('mouseover');
    cy.findByText('Error uploading object. Click to retry.').should(
      'be.visible'
    );
  });

  /*
   * - Tests error UI when bucket object list fails to load.
   * - Visits bucket details page, mocks API error response.
   * - Confirms that error is displayed.
   */
  it('shows error upon object list retrieval failure', () => {
    const bucketLabel = randomLabel();
    const bucketRegion = 'us-southeast';
    const bucketMock = objectStorageBucketFactory.build({
      region: bucketRegion,
      hostname: `${bucketLabel}.${bucketRegion}-1.linodeobjects.com`,
      label: bucketLabel,
      objects: 0,
    });

    mockGetBuckets([bucketMock]).as('getBuckets');
    mockGetBucketObjects(
      bucketLabel,
      bucketRegion,
      makeError(randomString()),
      404
    ).as('getBucketObjects');

    cy.visitWithLogin(`/object-storage/buckets/${bucketRegion}/${bucketLabel}`);
    cy.wait('@getBucketObjects');
    cy.findByText('We were unable to load your Objects.').should('be.visible');
  });
});
