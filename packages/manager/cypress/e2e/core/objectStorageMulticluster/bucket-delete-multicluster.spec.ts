import { randomLabel } from 'support/util/random';
import { accountFactory, objectStorageBucketFactory } from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetBuckets,
  mockDeleteBucket,
} from 'support/intercepts/object-storage';
import { ui } from 'support/ui';

describe('Object Storage Multicluster Bucket delete', () => {
  /*
   * - Tests core object storage bucket deletion flow using mocked API responses.
   * - Mocks existing buckets.
   * - Deletes mocked bucket, confirms that landing page reflects deletion.
   */
  it('can delete object storage bucket with OBJ Multicluster', () => {
    const bucketLabel = randomLabel();
    const bucketCluster = 'us-southeast-1';
    const bucketMock = objectStorageBucketFactory.build({
      label: bucketLabel,
      cluster: bucketCluster,
      hostname: `${bucketLabel}.${bucketCluster}.linodeobjects.com`,
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
    });

    mockGetBuckets([bucketMock]).as('getBuckets');
    mockDeleteBucket(bucketLabel, bucketMock.region!).as('deleteBucket');

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
