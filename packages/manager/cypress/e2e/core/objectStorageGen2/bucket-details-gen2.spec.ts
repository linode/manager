import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetBucketsForRegion,
  mockGetObjectStorageEndpoints,
  mockGetBucketAccess,
} from 'support/intercepts/object-storage';
import {
  accountFactory,
  objectStorageBucketFactoryGen2,
  objectStorageEndpointsFactory,
  regionFactory,
} from 'src/factories';
import { ACLType, ObjectStorageEndpointTypes } from '@linode/api-v4';
//import { checkRateLimitsTable } from './bucket-create-gen2.spec';

describe('Object Storage Gen 2 bucket details tabs', () => {
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

  const mockRegion = regionFactory.build({
    capabilities: ['Object Storage'],
  });

  const mockAccess = {
    acl: 'private' as ACLType,
    acl_xml: '',
    cors_enabled: true,
    cors_xml: '',
  };

  const createMocksBasedOnEndpointType = (
    endpointType: ObjectStorageEndpointTypes
  ) => {
    const mockBucket = objectStorageBucketFactoryGen2.build({
      endpoint_type: endpointType,
      region: mockRegion.id,
    });
    const mockEndpoint = objectStorageEndpointsFactory.build({
      endpoint_type: endpointType,
      region: mockRegion.id,
    });

    return { mockBucket, mockEndpoint };
  };

  describe('Access and SSL/TLS tabs', () => {
    ['E0', 'E1'].forEach((endpoint: ObjectStorageEndpointTypes) => {
      /**
       * Parameterized test for object storage endpoint types E0 and E1
       * - Confirms the CORS toggle still appears
       * - Confirms the SSL/TLS tab appears
       */
      it(`does not hide the CORS toggle and SSL/TLS tab for buckets with an ${endpoint} endpoint`, () => {
        const { mockBucket, mockEndpoint } = createMocksBasedOnEndpointType(
          endpoint
        );
        const { cluster, label } = mockBucket;

        mockGetBucketAccess(label, cluster, mockAccess).as('getBucketAccess');
        mockGetBucketsForRegion(mockRegion.id, [mockBucket]).as(
          'getBucketsForRegion'
        );
        mockGetObjectStorageEndpoints([mockEndpoint]).as(
          'getObjectStorageEndpoints'
        );

        cy.visitWithLogin(`/object-storage/buckets/${cluster}/${label}/access`);
        cy.wait([
          '@getFeatureFlags',
          '@getAccount',
          '@getObjectStorageEndpoints',
          '@getBucketsForRegion',
          '@getBucketAccess',
        ]);

        cy.findByText('Bucket Access').should('be.visible');
        cy.findByLabelText('Access Control List (ACL)').should('be.visible');
        // confirm CORS is visible
        cy.findByText('CORS Enabled').should('be.visible');
        cy.contains(
          'Whether Cross-Origin Resource Sharing is enabled for all origins. For more fine-grained control of CORS, please use another S3-compatible tool.'
        ).should('be.visible');

        // Confirm SSL/TLS tab is not hidden and is clickable
        cy.findByText('SSL/TLS').should('be.visible').click();
        cy.url().should('endWith', '/ssl');
      });
    });

    ['E2', 'E3'].forEach((endpoint: ObjectStorageEndpointTypes) => {
      /**
       * Parameterized test for object storage endpoint types E2 and E3
       * - Confirms the CORS toggle is hidden
       * - Confirms the SSL/TLS tab is hidden
       */
      it(`hides the CORS toggle and SSL/TLS tab for for buckets with an ${endpoint} endpoint`, () => {
        const { mockBucket, mockEndpoint } = createMocksBasedOnEndpointType(
          endpoint
        );
        const { cluster, label } = mockBucket;

        mockGetBucketAccess(label, cluster, mockAccess).as('getBucketAccess');
        mockGetBucketsForRegion(mockRegion.id, [mockBucket]).as(
          'getBucketsForRegion'
        );
        mockGetObjectStorageEndpoints([mockEndpoint]).as(
          'getObjectStorageEndpoints'
        );

        cy.visitWithLogin(`/object-storage/buckets/${cluster}/${label}/access`);
        cy.wait([
          '@getFeatureFlags',
          '@getAccount',
          '@getObjectStorageEndpoints',
          '@getBucketsForRegion',
          '@getBucketAccess',
        ]);

        cy.findByText('Bucket Access').should('be.visible');
        cy.findByLabelText('Access Control List (ACL)').should('be.visible');
        // confirm CORS is not visible
        cy.contains(
          'CORS (Cross Origin Sharing) is not available for endpoint types E2 and E3'
        ).should('be.visible');

        // confirms the SSL/TLS tab is not present
        cy.findByText('SSL/TLS').should('not.exist');
      });
    });
  });

  describe('Properties tab', () => {
    // TODO: Confirm AC as rn the properties tab shows up for E0/E1 (but it's basically a blank page)
    // /**
    //  * - Confirms absence of Properties tab for buckets with endpoint type E0
    //  */
    // it('does not show the properties tab for buckets with endpoint type E0', () => {
    // });
    // /**
    //  * - Confirms absence of Properties tab for buckets with endpoint type E1
    //  */
    // it('does not show the properties tab for buckets with endpoint type E1', () => {
    // });
    /**
     * For buckets with endpoint type E2,
     * - Confirms Properties tab is present
     * - Confirms the Properties tab contains the bucket rate limit table
     */
    // it('shows the properties tab and rate limit table for buckets with endpoint type E2', () => {
    //   createMocksAndNavigateToTab('E2', 'properties');
    //   cy.findByText('Bucket Rate Limits');
    //   cy.contains(
    //     'Specifies the maximum Requests Per Second (RPS) for a bucket. To increase it to High, open a support ticket. Understand bucket rate limits.'
    //   ).should('be.visible');
    //   checkRateLimitsTable('E2');
    // });
    /**
     * For buckets with endpoint type E3,
     * - Confirms Properties tab is present
     * - Confirms the Properties tab contains the bucket rate limit table
     */
    // it('shows the properties tab and rate limit table for buckets with endpoint type E3', () => {
    //   createMocksAndNavigateToTab('E3', 'properties');
    //   cy.findByText('Bucket Rate Limits');
    //   cy.contains(
    //     'Specifies the maximum Requests Per Second (RPS) for a bucket. To increase it to High, open a support ticket. Understand bucket rate limits.'
    //   ).should('be.visible');
    //   checkRateLimitsTable('E3');
    // });
  });
});
