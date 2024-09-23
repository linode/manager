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
import { ACLType } from '@linode/api-v4';

describe('Object Storage Gen 2 bucket details tab tests', () => {
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

  // TODO - figure out how to simulate it.each with mocha
  /**
   * - Confirms the CORS toggle still appears for buckets with endpoint type E0
   * - Confirms the SSL/TLS tab appears for buckets with endpoint type E0
   */
  it.only('does not hide the CORS toggle or SSL/TLS tab for buckets with the E0 endpoint', () => {
    const mockBucket = objectStorageBucketFactoryGen2.build({
      endpoint_type: 'E0',
      region: mockRegion.id,
    });
    const { cluster, label } = mockBucket;
    const mockEndpoint = objectStorageEndpointsFactory.build({
      endpoint_type: 'E0',
      region: mockRegion.id,
    });
    const mockAccess = {
      acl: 'private' as ACLType,
      acl_xml: '',
      cors_enabled: true,
      cors_xml: '',
    };

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
    cy.findByText(
      /Whether Cross-Origin Resource Sharing is enabled for all origins. For more fine-grained control of CORS, please use another/
    ).should('be.visible');
    cy.findByText(/S3-compatible tool/).should('be.visible');

    // Confirm SSL/TLS tab is not hidden and is clickable
    cy.findByText('SSL/TLS').should('be.visible').click();
    cy.url().should('endWith', '/ssl');
  });

  /**
   * - Confirms the CORS toggle still appears for buckets with endpoint type E1
   * - Confirms the SSL/TLS tab appears for buckets with endpoint type E1
   */
  it('does not hide the CORS toggle or SSL/TLS tab for buckets with the E1 endpoint', () => {});

  /**
   * - Confirms the CORS and display notice is hidden for buckets with endpoint type E2
   * - Confirms the SSL/TLS tab is hidden for buckets with endpoint type E2
   */
  it('hides the CORS and display notice and disables the SSL/TLS tab for the E2 endpoint', () => {});

  /**
   * - Confirms the CORS and display notice is hidden for buckets with endpoint type E3
   * - Confirms the SSL/TLS tab is hidden for buckets with endpoint type E3
   */
  it('hides the CORS and display notice and disables the SSL/TLS tab for the E3 endpoint', () => {});
});
