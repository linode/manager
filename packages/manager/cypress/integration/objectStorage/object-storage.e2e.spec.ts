/**
 * @file End-to-end tests for Object Storage operations.
 */

import { createBucket } from '@linode/api-v4/lib/object-storage';
import { objectStorageBucketFactory } from 'src/factories';
import { authenticate } from 'support/api/authentication';
import {
  interceptCreateBucket,
  interceptDeleteBucket,
  interceptGetBuckets,
} from 'support/intercepts/object-storage';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

authenticate();
describe('object storage end-to-end tests', () => {
  /*
   * - Tests object bucket creation flow using real API responses.
   * - Creates bucket.
   * - Confirms bucket is listed in table.
   */
  it('can create object storage bucket - e2e', () => {
    const bucketLabel = randomLabel();
    const bucketRegion = 'Atlanta, GA';
    const bucketCluster = 'us-southeast-1';
    const bucketHostname = `${bucketLabel}.${bucketCluster}.linodeobjects.com`;

    interceptGetBuckets().as('getBuckets');
    interceptCreateBucket().as('createBucket');

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

    cy.wait(['@createBucket', '@getBuckets']);

    cy.findByText(bucketLabel).should('be.visible');
    cy.findByText(bucketRegion).should('be.visible');
    cy.findByText(bucketHostname).should('be.visible');
  });

  /*
   * - Tests core object storage bucket deletion flows using real API responses.
   * - Creates a bucket using APIv4 before test begins.
   * - Deletes created bucket, confirms that landing page reflects deletion.
   */
  it('can delete object storage bucket - e2e', () => {
    const bucketLabel = randomLabel();
    const bucketCluster = 'us-southeast-1';

    const setUpBucket = () => {
      return createBucket(
        objectStorageBucketFactory.build({
          label: bucketLabel,
          cluster: bucketCluster,
        })
      );
    };

    cy.defer(setUpBucket()).then(() => {
      interceptGetBuckets().as('getBuckets');
      interceptDeleteBucket(bucketLabel, bucketCluster).as('deleteBucket');

      cy.visitWithLogin('/object-storage/buckets');
      cy.wait('@getBuckets');

      cy.findByText(bucketLabel)
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
            .findButtonByTitle('Delete Bucket')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@deleteBucket').its('response.statusCode').should('eq', 200);
      cy.findByText(bucketLabel).should('not.exist');
    });
  });

  /*
   * @TODO Add E2E test flows to test object storage access controls and object
   * upload/deletion.
   */
  it.skip('can update bucket access control - e2e', () => {});
  it.skip('can upload and delete objects - e2e', () => {});
  it.skip('cannot delete bucket that has one or more object - e2e', () => {});
  it.skip('verifies object access control works as expected - e2e', () => {});
});
