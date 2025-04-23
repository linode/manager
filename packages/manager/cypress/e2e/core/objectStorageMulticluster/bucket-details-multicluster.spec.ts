import { regionFactory } from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetBucket,
  mockGetBucketObjects,
  mockGetBuckets,
} from 'support/intercepts/object-storage';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

import { accountFactory, objectStorageBucketFactory } from 'src/factories';

describe('Object Storage Multicluster Bucket Details Tabs', () => {
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
    /*
     * - Confirms that Gen 2-specific "Properties" tab is absent when OBJ Multicluster is enabled.
     */
    it(`confirms the Properties tab does not exist for users without 'Object Storage Endpoint Types' capability`, () => {
      const { label } = mockBucket;

      mockGetBucket(label, mockRegion.id);
      mockGetBuckets([mockBucket]);
      mockGetBucketObjects(label, mockRegion.id, []);
      mockGetRegions([mockRegion]);

      cy.visitWithLogin(
        `/object-storage/buckets/${mockRegion.id}/${label}/properties`
      );

      cy.wait(['@getFeatureFlags', '@getAccount']);

      // Confirm that expected tabs are visible.
      ui.tabList.findTabByTitle('Objects').should('be.visible');
      ui.tabList.findTabByTitle('Access').should('be.visible');
      ui.tabList.findTabByTitle('SSL/TLS').should('be.visible');

      // Confirm that "Properties" tab is absent.
      cy.findByText('Properties').should('not.exist');
    });
  });
});
