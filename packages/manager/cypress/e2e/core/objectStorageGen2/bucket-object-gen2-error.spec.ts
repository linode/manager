import 'cypress-file-upload';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  accountFactory,
  objectStorageBucketFactoryGen2,
  regionFactory,
} from 'src/factories';
import { mockGetRegions } from 'support/intercepts/regions';
import { randomLabel } from 'support/util/random';
import {
  mockGetBucketsForRegion,
  mockGetBucketsForRegionError,
} from 'support/intercepts/object-storage';

describe('Object Storage Gen2 bucket object tests', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      objMultiCluster: true,
      objectStorageGen2: { enabled: true },
    }).as('getFeatureFlags');
    mockGetAccount(
      accountFactory.build({
        capabilities: [
          'Object Storage',
          'Object Storage Endpoint Types',
          'Object Storage Access Key Regions',
        ],
      })
    ).as('getAccount');
  });

  it('UI should display buckets for region1, warning message for region2 ', () => {
    const mockRegions = regionFactory.buildList(2, {
      capabilities: ['Object Storage'],
    });
    mockGetRegions(mockRegions).as('getRegions');
    const mockBucket1 = objectStorageBucketFactoryGen2.build({
      label: randomLabel(),
      region: mockRegions[0].id,
    });
    const mockBucket2 = objectStorageBucketFactoryGen2.build({
      label: randomLabel(),
      region: mockRegions[1].id,
    });
    console.log('REGIONS ', mockRegions[0].id, mockRegions[1].id);
    // this bucket should display
    mockGetBucketsForRegion(mockRegions[0].id, [mockBucket1]).as(
      'getBucketsForRegion0'
    );
    // this bucket should not display
    mockGetBucketsForRegion(mockRegions[1].id, [mockBucket2]).as(
      'getBucketsForRegion1'
    );
    mockGetBucketsForRegionError(mockRegions[1].id).as(
      'getBucketsForRegionError'
    );

    cy.visitWithLogin('/object-storage/buckets');
    cy.wait([
      '@getRegions',
      '@getBucketsForRegion0',
      '@getBucketsForRegion1',
      '@getBucketsForRegionError',
    ]);
  });
});
