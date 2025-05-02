import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockDeleteBucket,
  mockGetBuckets,
} from 'support/intercepts/object-storage';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { accountFactory, objectStorageBucketFactory } from 'src/factories';

describe('Object Storage Multicluster Bucket delete', () => {
  /*
   * - Tests core object storage bucket deletion flow using mocked API responses.
   * - Mocks existing buckets.
   * - Deletes mocked bucket, confirms that landing page reflects deletion.
   */
  it('can delete object storage bucket with OBJ Multicluster', () => {
    const bucketLabel = randomLabel();
    const region = chooseRegion().id;
    const bucketMock = objectStorageBucketFactory.build({
      cluster: region,
      hostname: `${bucketLabel}.${region}.linodeobjects.com`,
      label: bucketLabel,
      objects: 0,
      region,
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
