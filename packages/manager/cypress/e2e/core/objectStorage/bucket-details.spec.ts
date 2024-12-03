import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetBucketsForRegion } from 'support/intercepts/object-storage';
import {
  accountFactory,
  objectStorageBucketFactory,
  regionFactory,
} from 'src/factories';
import { randomLabel } from 'support/util/random';

describe('Object Storage Gen 1 Bucket Details Tabs', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      objMultiCluster: true,
      objectStorageGen2: { enabled: false },
    }).as('getFeatureFlags');
    mockGetAccount(
      accountFactory.build({
        capabilities: ['Object Storage', 'Object Storage Access Key Regions'],
      })
    ).as('getAccount');
  });

  const mockRegion = regionFactory.build({
    capabilities: ['Object Storage'],
  });

  const mockBucket = objectStorageBucketFactory.build({
    label: randomLabel(),
    region: mockRegion.id,
  });

  describe('Properties tab without required capabilities', () => {
    beforeEach(() => {
      mockGetAccount(
        accountFactory.build({
          capabilities: ['Object Storage'],
        })
      ).as('getAccount');
      mockAppendFeatureFlags({
        objMultiCluster: true,
        objectStorageGen2: { enabled: false },
      }).as('getFeatureFlags');
    });

    it(`confirms the Properties tab does not exist for users without 'Object Storage Endpoint Types' capability`, () => {
      const { region, label } = mockBucket;

      mockGetBucketsForRegion(mockRegion.id, [mockBucket]).as(
        'getBucketsForRegion'
      );

      cy.visitWithLogin(
        `/object-storage/buckets/${region}/${label}/properties`
      );

      cy.wait(['@getFeatureFlags', '@getAccount']);

      cy.wait(1000);

      // Confirm Properties tab is not visible
      cy.findByText('Properties', { timeout: 15000 }).should('not.exist');
    });
  });
});
