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
import {
  ACLType,
  ObjectStorageBucketAccess,
  ObjectStorageEndpointTypes,
} from '@linode/api-v4';
import { checkRateLimitsTable } from './bucket-create-gen2.spec';

describe.only('Object Storage Gen 2 bucket details tabs', () => {
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

  const createMocksAndNavigateToTab = (
    endpointType: ObjectStorageEndpointTypes,
    tab: string,
    mockAccess?: ObjectStorageBucketAccess
  ) => {
    const mockBucket = objectStorageBucketFactoryGen2.build({
      endpoint_type: endpointType,
      region: mockRegion.id,
    });
    const { cluster, label } = mockBucket;
    const mockEndpoint = objectStorageEndpointsFactory.build({
      endpoint_type: endpointType,
      region: mockRegion.id,
    });

    mockGetBucketsForRegion(mockRegion.id, [mockBucket]).as(
      'getBucketsForRegion'
    );
    mockGetObjectStorageEndpoints([mockEndpoint]).as(
      'getObjectStorageEndpoints'
    );

    cy.visitWithLogin(`/object-storage/buckets/${cluster}/${label}/${tab}`);
    cy.wait([
      '@getFeatureFlags',
      '@getAccount',
      '@getObjectStorageEndpoints',
      '@getBucketsForRegion',
    ]);

    if (mockAccess) {
      mockGetBucketAccess(label, cluster, mockAccess).as('getBucketAccess');
      cy.wait('@getBucketAccess');
    }
  };

  describe('Access and SSL/TLS tabs', () => {
    const mockAccess = {
      acl: 'private' as ACLType,
      acl_xml: '',
      cors_enabled: true,
      cors_xml: '',
    };

    const confirmCORSToggleAndSSLTabPresent = () => {
      cy.findByText('Bucket Access').should('be.visible');
      cy.findByLabelText('Access Control List (ACL)').should('be.visible');
      // confirm CORS is visible
      cy.findByText('CORS Enabled').should('be.visible');
      cy.findByText(
        /Whether Cross-Origin Resource Sharing is enabled for all origins. For more fine-grained control of CORS, please use another/
      ).should('be.visible');
      cy.findByText(/S3-compatible tool/).should('be.visible');

      // Confirm SSL/TLS tab is not hidden and is clickable
      cy.findByText('SSL/TLS').should('be.visible').click();
      cy.url().should('endWith', '/ssl');
    };

    const confirmCORSNotPresent = () => {
      cy.findByText('Bucket Access').should('be.visible');
      cy.findByLabelText('Access Control List (ACL)').should('be.visible');
      // confirm CORS is not visible
      cy.findByText(
        /CORS \(Cross Origin Sharing\) is not available for endpoint types E2 and E3/
      ).should('be.visible');
    };

    /**
     * - Confirms the CORS toggle still appears for buckets with endpoint type E0
     * - Confirms the SSL/TLS tab appears for buckets with endpoint type E0
     */
    it('does not hide the CORS toggle or SSL/TLS tab for buckets with an E0 endpoint', () => {
      createMocksAndNavigateToTab('E0', 'access', mockAccess);

      // confirm CORS toggle is visible and the SSL/TLS tab is present
      confirmCORSToggleAndSSLTabPresent();
    });

    /**
     * - Confirms the CORS toggle still appears for buckets with endpoint type E1
     * - Confirms the SSL/TLS tab appears for buckets with endpoint type E1
     */
    it('does not hide the CORS toggle or SSL/TLS tab for buckets with an E1 endpoint', () => {
      createMocksAndNavigateToTab('E1', 'access', mockAccess);

      // confirm CORS toggle is visible and the SSL/TLS tab is present
      confirmCORSToggleAndSSLTabPresent();
    });

    /**
     * - Confirms the CORS and display notice is hidden for buckets with endpoint type E2
     * - Confirms the SSL/TLS tab appears for buckets with endpoint type E2
     */
    it('hides the CORS toggle and displays a notice for buckets with an E2 endpoint', () => {
      createMocksAndNavigateToTab('E2', 'access', mockAccess);

      // confirms the CORS toggle is not visible
      confirmCORSNotPresent();

      // Confirm SSL/TLS tab is not hidden and is clickable
      cy.findByText('SSL/TLS').should('be.visible').click();
      cy.url().should('endWith', '/ssl');
    });

    /**
     * - Confirms the CORS and display notice is hidden for buckets with endpoint type E3
     * - Confirms the SSL/TLS tab is hidden for buckets with endpoint type E3
     */
    it('hides the CORS toggle, displays a notice, and disables the SSL/TLS tab for buckets with an E3 endpoint', () => {
      createMocksAndNavigateToTab('E3', 'access', mockAccess);

      // confirms the CORS toggle is not visible
      confirmCORSNotPresent();

      // Confirm SSL/TLS tab is hidden
      cy.findByText('SSL/TLS').should('not.exist');
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
    it('shows the properties tab and rate limit table for buckets with endpoint type E2', () => {
      createMocksAndNavigateToTab('E2', 'properties');

      cy.findByText('Bucket Rate Limits');
      cy.contains(
        'Specifies the maximum Requests Per Second (RPS) for a bucket. To increase it to High, open a support ticket. Understand bucket rate limits.'
      ).should('be.visible');
      checkRateLimitsTable('E2');
    });

    /**
     * For buckets with endpoint type E3,
     * - Confirms Properties tab is present
     * - Confirms the Properties tab contains the bucket rate limit table
     */
    it('shows the properties tab and rate limit table for buckets with endpoint type E3', () => {
      createMocksAndNavigateToTab('E3', 'properties');

      cy.findByText('Bucket Rate Limits');
      cy.contains(
        'Specifies the maximum Requests Per Second (RPS) for a bucket. To increase it to High, open a support ticket. Understand bucket rate limits.'
      ).should('be.visible');
      checkRateLimitsTable('E3');
    });
  });
});
