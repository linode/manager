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

  const mockAccess = {
    acl: 'private' as ACLType,
    acl_xml: '',
    cors_enabled: true,
    cors_xml: '',
  };

  const createMocksAndNavigateToPage = (
    endpointType: ObjectStorageEndpointTypes
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
  it('does not hide the CORS toggle or SSL/TLS tab for buckets with the E0 endpoint', () => {
    createMocksAndNavigateToPage('E0');

    // confirm CORS toggle is visible and the SSL/TLS tab is present
    confirmCORSToggleAndSSLTabPresent();
  });

  /**
   * - Confirms the CORS toggle still appears for buckets with endpoint type E1
   * - Confirms the SSL/TLS tab appears for buckets with endpoint type E1
   */
  it('does not hide the CORS toggle or SSL/TLS tab for buckets with the E1 endpoint', () => {
    createMocksAndNavigateToPage('E1');

    // confirm CORS toggle is visible and the SSL/TLS tab is present
    confirmCORSToggleAndSSLTabPresent();
  });

  /**
   * - Confirms the CORS and display notice is hidden for buckets with endpoint type E2
   * - Confirms the SSL/TLS tab is visible for buckets with endpoint type E2
   */
  it('hides the CORS and display notice and hides the SSL/TLS tab for the E2 endpoint', () => {
    createMocksAndNavigateToPage('E2');

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
  it('hides the CORS and display notice and disables the SSL/TLS tab for the E3 endpoint', () => {
    createMocksAndNavigateToPage('E3');

    // confirms the CORS toggle is not visible
    confirmCORSNotPresent();

    // Confirm SSL/TLS tab is hidden
    cy.findByText('SSL/TLS').should('not.exist');
  });
});
