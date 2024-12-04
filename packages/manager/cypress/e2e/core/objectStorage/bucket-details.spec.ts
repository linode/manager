import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';
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
    it(`confirms the Properties tab does not exist for users without 'Object Storage Endpoint Types' capability`, () => {
      const { region, label } = mockBucket;

      cy.visitWithLogin(
        `/object-storage/buckets/${region}/${label}/properties`
      );

      cy.wait(['@getFeatureFlags', '@getAccount']);

      // Confirm that expected tabs are visible.
      ui.tabList.findTabByTitle('Objects').should('be.visible');
      ui.tabList.findTabByTitle('Access').should('be.visible');
      ui.tabList.findTabByTitle('SSL/TLS').should('be.visible');

      // Confirm that "Properties" tab is absent.
      cy.findByText('Properties').should('not.exist');

      // TODO Confirm "Not Found" notice is present.
    });
  });
});
