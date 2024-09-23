import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { accountFactory } from 'src/factories';

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

  /**
   * - Confirms the CORS toggle still appears for buckets with endpoint type E0
   * - Confirms the SSL/TLS tab appears for buckets with endpoint type E0
   */
  it('does not hide the CORS toggle or SSL/TLS tab for buckets with the E0 endpoint', () => {

  });
    
  /**
   * - Confirms the CORS toggle still appears for buckets with endpoint type E1
   * - Confirms the SSL/TLS tab appears for buckets with endpoint type E1
   */
  it('does not hide the CORS toggle or SSL/TLS tab for buckets with the E1 endpoint', () => {

  });

  /**
   * - Confirms the CORS and display notice is hidden for buckets with endpoint type E2
   * - Confirms the SSL/TLS tab is hidden for buckets with endpoint type E2
   */
  it('hides the CORS and display notice and disables the SSL/TLS tab for the E2 endpoint', () => {

  });

  /**
   * - Confirms the CORS and display notice is hidden for buckets with endpoint type E3
   * - Confirms the SSL/TLS tab is hidden for buckets with endpoint type E3
   */
    it('hides the CORS and display notice and disables the SSL/TLS tab for the E3 endpoint', () => {

    });
});