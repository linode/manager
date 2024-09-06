import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetObjectStorageEndpoints,
  mockGetBuckets,
  mockDeleteBucket,
  mockCreateBucket,
} from 'support/intercepts/object-storage';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import {
  accountFactory,
  objectStorageBucketFactoryGen2,
  objectStorageEndpointsFactory,
  regionFactory,
} from 'src/factories';
import { chooseRegion } from 'support/util/regions';
import type {
  ObjectStorageEndpoint,
  ObjectStorageEndpointTypes,
} from '@linode/api-v4';

describe('Object Storage Gen2 create bucket tests', () => {
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

  // Moved these constants to top of scope - they will likely be used for other obj storage gen2 bucket create tests
  const mockRegions = regionFactory.buildList(10, {
    capabilities: ['Object Storage'],
  });
  const mockRegion = chooseRegion({ regions: [...mockRegions] });

  const mockEndpoints: ObjectStorageEndpoint[] = [
    objectStorageEndpointsFactory.build({
      endpoint_type: 'E0',
      region: mockRegion.id,
      s3_endpoint: null,
    }),
    objectStorageEndpointsFactory.build({
      endpoint_type: 'E1',
      region: mockRegion.id,
      s3_endpoint: null,
    }),
    objectStorageEndpointsFactory.build({
      endpoint_type: 'E1',
      region: mockRegion.id,
      s3_endpoint: 'us-sea-1.linodeobjects.com',
    }),
    objectStorageEndpointsFactory.build({
      endpoint_type: 'E2',
      region: mockRegion.id,
      s3_endpoint: null,
    }),
    objectStorageEndpointsFactory.build({
      endpoint_type: 'E3',
      region: mockRegion.id,
      s3_endpoint: null,
    }),
  ];

  const checkRateLimitsTable = (endpointType: ObjectStorageEndpointTypes) => {
    const expectedHeaders = ['Limits', 'GET', 'PUT', 'LIST', 'DELETE', 'OTHER'];
    const expectedBasicValues = ['Basic', '2,000', '500', '100', '200', '400'];
    const expectedHighValues =
      endpointType === 'E3'
        ? ['High', '20,000', '2,000', '400', '400', '1,000']
        : ['High', '5,000', '1,000', '200', '200', '800'];

    cy.get('[data-testid="bucket-rate-limit-table"]').within(() => {
      expectedHeaders.forEach((header, index) => {
        cy.get('th').eq(index).should('contain.text', header);
      });

      cy.contains('tr', 'Basic').within(() => {
        expectedBasicValues.forEach((value, index) => {
          cy.get('td').eq(index).should('contain.text', value);
        });
      });

      cy.contains('tr', 'High').within(() => {
        expectedHighValues.forEach((value, index) => {
          cy.get('td').eq(index).should('contain.text', value);
        });
      });

      // Check that Basic radio button is checked
      cy.findByLabelText('Basic').should('be.checked');
    });
  };

  /**
   * Confirms UI flow for creating a gen2 Object Storage bucket with endpoint E0
   * Confirms all endpoints are displayed regardless if there's multiple of the same type
   * Confirms S3 endpoint hostname displayed to differentiate between identical options in the dropdown
   */
  it('can create a bucket with endpoint type 0', () => {
    const endpointTypeE0 = 'Legacy (E0)';
    const bucketLabel = randomLabel();

    //wait for the newly 'created' mocked bucket to appear
    const mockBucket = objectStorageBucketFactoryGen2.build({
      label: bucketLabel,
      region: mockRegion.id,
      endpoint_type: 'E0',
      s3_endpoint: undefined,
    });

    mockGetBuckets([]).as('getBuckets');
    mockDeleteBucket(bucketLabel, mockRegion.id).as('deleteBucket');
    mockCreateBucket({
      label: bucketLabel,
      endpoint_type: 'E0',
      cors_enabled: true,
      region: mockRegion.id,
    }).as('createBucket');

    mockAppendFeatureFlags({
      objMultiCluster: true,
      objectStorageGen2: { enabled: true },
    }).as('getFeatureFlags');

    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );

    mockGetRegions(mockRegions);

    cy.visitWithLogin('/object-storage/buckets/create');
    cy.wait([
      '@getFeatureFlags',
      '@getBuckets',
      '@getAccount',
      '@getObjectStorageEndpoints',
    ]);

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        cy.findByText('Label').click().type(bucketLabel);
        ui.regionSelect.find().click().type(`${mockRegion.label}{enter}`);
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

    mockGetBuckets([mockBucket]).as('getBuckets');
    cy.wait(['@getBuckets']);

    // Confirm request body has expected data
    cy.wait('@createBucket').then((xhr) => {
      const requestPayload = xhr.request.body;
      expect(requestPayload['endpoint_type']).to.equal('E0');
      expect(requestPayload['cors_enabled']).to.equal(true);
    });

    ui.drawer.find().should('not.exist');

    // Confirm that bucket is created, initiate deletion for cleanup
    cy.findByText(endpointTypeE0).should('be.visible');
    cy.findByText(bucketLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(mockRegion.label).should('be.visible');
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
    mockGetBuckets([]).as('getBuckets');
    cy.wait(['@deleteBucket', '@getBuckets']);
    cy.findByText(bucketLabel).should('not.exist');
  });

  /**
   * Confirms UI flow for creating a gen2 Object Storage bucket with endpoint E2
   */
  it('can create a bucket with endpoint type 2', () => {
    const endpointTypeE2 = 'Standard (E2)';
    const bucketLabel = randomLabel();

    //wait for the newly 'created' mocked bucket to appear
    const mockBucket = objectStorageBucketFactoryGen2.build({
      label: bucketLabel,
      region: mockRegion.id,
      endpoint_type: 'E2',
      s3_endpoint: undefined,
    });

    mockGetBuckets([]).as('getBuckets');
    mockDeleteBucket(bucketLabel, mockRegion.id).as('deleteBucket');
    mockCreateBucket({
      label: bucketLabel,
      endpoint_type: 'E2',
      cors_enabled: true,
      region: mockRegion.id,
    }).as('createBucket');

    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );

    mockGetRegions(mockRegions);

    cy.visitWithLogin('/object-storage/buckets/create');
    cy.wait([
      '@getFeatureFlags',
      '@getBuckets',
      '@getAccount',
      '@getObjectStorageEndpoints',
    ]);

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        cy.findByText('Label').click().type(bucketLabel);
        ui.regionSelect.find().click().type(`${mockRegion.label}{enter}`);
        cy.findByLabelText('Object Storage Endpoint Type')
          .should('be.visible')
          .click();

        // Select E2 endpoint
        ui.autocompletePopper
          .findByTitle('Standard (E2)')
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Confirm bucket rate limits text for E2 endpoint
        cy.findByText('Bucket Rate Limits').should('be.visible');
        cy.contains(
          'Specifies the maximum Requests Per Second (RPS) for a bucket. To increase it to High, open a support ticket. Understand bucket rate limits.'
        ).should('be.visible');

        // Confirm bucket rate limit table should exist when E2 endpoint is selected
        cy.get('[data-testid="bucket-rate-limit-table"]').should('exist');

        // Confirm that basic rate limits table is displayed
        checkRateLimitsTable(mockBucket.endpoint_type!);

        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    mockGetBuckets([mockBucket]).as('getBuckets');
    cy.wait(['@getBuckets']);

    // Confirm request body has expected data
    cy.wait('@createBucket').then((xhr) => {
      const requestPayload = xhr.request.body;
      expect(requestPayload['endpoint_type']).to.equal('E2');
      expect(requestPayload['cors_enabled']).to.equal(false);
    });

    ui.drawer.find().should('not.exist');

    // Confirm that bucket is created, initiate deletion for cleanup
    cy.findByText(endpointTypeE2).should('be.visible');
    cy.findByText(bucketLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(mockRegion.label).should('be.visible');
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
    mockGetBuckets([]).as('getBuckets');
    cy.wait(['@deleteBucket', '@getBuckets']);
    cy.findByText(bucketLabel).should('not.exist');
  });

  /**
   * Confirms UI flow for creating a gen2 Object Storage bucket with endpoint E3
   */
  it('can create a bucket with endpoint type 3', () => {
    const endpointTypeE3 = 'Standard (E3)';
    const bucketLabel = randomLabel();

    //wait for the newly 'created' mocked bucket to appear
    const mockBucket = objectStorageBucketFactoryGen2.build({
      label: bucketLabel,
      region: mockRegion.id,
      endpoint_type: 'E3',
      s3_endpoint: undefined,
    });

    mockGetBuckets([]).as('getBuckets');
    mockDeleteBucket(bucketLabel, mockRegion.id).as('deleteBucket');
    mockCreateBucket({
      label: bucketLabel,
      endpoint_type: 'E3',
      cors_enabled: false,
      region: mockRegion.id,
    }).as('createBucket');

    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );

    mockGetRegions(mockRegions);

    cy.visitWithLogin('/object-storage/buckets/create');
    cy.wait([
      '@getFeatureFlags',
      '@getBuckets',
      '@getAccount',
      '@getObjectStorageEndpoints',
    ]);

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        cy.findByText('Label').click().type(bucketLabel);
        ui.regionSelect.find().click().type(`${mockRegion.label}{enter}`);
        cy.findByLabelText('Object Storage Endpoint Type')
          .should('be.visible')
          .click();

        // Select E3 endpoint
        ui.autocompletePopper
          .findByTitle('Standard (E3)')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Confirm bucket rate limits text for E3 endpoint
        cy.findByText('Bucket Rate Limits').should('be.visible');
        cy.contains(
          'Specifies the maximum Requests Per Second (RPS) for a bucket. To increase it to High, open a support ticket. Understand bucket rate limits.'
        ).should('be.visible');

        // Confirm bucket rate limit table should exist when E3 endpoint is selected
        cy.get('[data-testid="bucket-rate-limit-table"]').should('exist');

        // Confirm that basic rate limits table is displayed
        checkRateLimitsTable(mockBucket.endpoint_type!);

        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    mockGetBuckets([mockBucket]).as('getBuckets');
    cy.wait(['@getBuckets']);

    // Confirm request body has expected data
    cy.wait('@createBucket').then((xhr) => {
      const requestPayload = xhr.request.body;
      expect(requestPayload['endpoint_type']).to.equal('E3');
      expect(requestPayload['cors_enabled']).to.equal(false);
    });

    ui.drawer.find().should('not.exist');

    // Confirm that bucket is created, initiate deletion for cleanup
    cy.findByText(endpointTypeE3).should('be.visible');
    cy.findByText(bucketLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(mockRegion.label).should('be.visible');
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
    mockGetBuckets([]).as('getBuckets');
    cy.wait(['@deleteBucket', '@getBuckets']);
    cy.findByText(bucketLabel).should('not.exist');
  });
});
