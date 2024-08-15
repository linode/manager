import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  interceptCreateBucket,
  interceptDeleteBucket,
  interceptGetBuckets,
  mockGetObjectStorageEndpoints,
} from 'support/intercepts/object-storage';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import { objectStorageEndpointsFactory, accountFactory } from 'src/factories';
import type { ObjectStorageEndpoint } from '@linode/api-v4';

describe('Object Storage Gen2 create bucket tests', () => {
  /**
   * Confirms UI flow for creating a gen2 Object Storage bucket with endpoint E0
   * Confirms all endpoints are displayed regardless if there's multiple of the same type
   * Confirms S3 endpoint hostname displayed to differentiate between identical options in the dropdown
   */
  it('can create a bucket with endpoint type 0', () => {
    const bucketLabel = randomLabel();
    const bucketRegion = 'Seattle, WA';
    const bucketCluster = 'us-sea';

    interceptGetBuckets().as('getBuckets');
    interceptDeleteBucket(bucketLabel, bucketCluster).as('deleteBucket');
    interceptCreateBucket().as('createBucket');

    const mockEndpoints: ObjectStorageEndpoint[] = [
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E0',
        region: 'us-sea',
        s3_endpoint: null,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E1',
        region: 'us-sea',
        s3_endpoint: null,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E1',
        region: 'us-sea',
        s3_endpoint: 'us-sea-1.linodeobjects.com',
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E2',
        region: 'us-sea',
        s3_endpoint: null,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E3',
        region: 'us-sea',
        s3_endpoint: null,
      }),
    ];

    mockAppendFeatureFlags({
      objMultiCluster: true,
      objectStorageGen2: { enabled: true },
    }).as('getFeatureFlags');
    mockGetAccount(
      accountFactory.build({
        capabilities: [
          'Object Storage Endpoint Types',
          'Object Storage Access Key Regions',
        ],
      })
    ).as('getAccount');

    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );

    cy.visitWithLogin('/object-storage/buckets/create');
    cy.wait(['@getFeatureFlags', '@getAccount', '@getObjectStorageEndpoints']);

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        cy.findByText('Label').click().type(bucketLabel);
        ui.regionSelect.find().click().type(`${bucketRegion}{enter}`);
        cy.findByLabelText('Object Storage Endpoint Type')
          .should('be.visible')
          .click();

        // verify that all mocked endpoints show up as options
        ui.autocompletePopper
          .findByTitle('Standard (E1)')
          .should('be.visible')
          .should('be.enabled');
        ui.autocompletePopper
          .findByTitle('Standard (E1) us-sea-1.linodeobjects.com')
          .should('be.visible')
          .should('be.enabled');
        ui.autocompletePopper
          .findByTitle('Standard (E2)')
          .should('be.visible')
          .should('be.enabled');
        ui.autocompletePopper
          .findByTitle('Standard (E3)')
          .should('be.visible')
          .should('be.enabled');

        // Select E0 endpoint
        ui.autocompletePopper
          .findByTitle('Legacy (E0)')
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Confirm bucket rate limits text for E0 endpoint
        cy.findByText('Bucket Rate Limits').should('be.visible');
        cy.contains(
          'This endpoint type supports up to 750 Requests Per Second (RPS). Understand bucket rate limits'
        ).should('be.visible');

        // Confirm bucket rate limit table should not exist when E0 endpoint is selected
        cy.get('[data-testid="bucket-rate-limit-table"]').should('not.exist');

        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm request body has expected data
    cy.wait('@createBucket').then((xhr) => {
      const requestPayload = xhr.request.body;
      expect(requestPayload['endpoint_type']).to.equal('E0');
      expect(requestPayload['cors_enabled']).to.equal(true);
    });

    ui.drawer.find().should('not.exist');

    // Confirm that bucket is created, initiate deletion for cleanup
    // TODO: when M3-8304 is complete, confirm endpoint type and endpoint url are visible
    cy.findByText(bucketLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(bucketRegion).should('be.visible');
        ui.button.findByTitle('Delete').should('be.visible').click();
      });

    ui.dialog
      .findByTitle(`Delete Bucket ${bucketLabel}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Bucket Name').click().type(bucketLabel);
        ui.buttonGroup
          .findButtonByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm bucket gets deleted
    cy.wait('@deleteBucket').its('response.statusCode').should('eq', 200);
    cy.findByText(bucketLabel).should('not.exist');
  });
});
