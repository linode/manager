import { regionFactory } from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateBucket,
  mockCreateBucketError,
  mockDeleteBucket,
  mockGetBucketAccess,
  mockGetBuckets,
  mockGetObjectStorageEndpoints,
} from 'support/intercepts/object-storage';
import { mockGetProfile } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { checkRateLimitsTable } from 'support/util/object-storage-gen2';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import {
  accountFactory,
  objectStorageBucketFactoryGen2,
  objectStorageEndpointsFactory,
} from 'src/factories';
import { profileFactory } from 'src/factories/profile';

import type { ACLType, ObjectStorageEndpoint } from '@linode/api-v4';

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

  const mockAccess = {
    acl: 'private' as ACLType,
    acl_xml: '',
    cors_enabled: true,
    cors_xml: '',
  };

  const bucketRateLimitsNotice =
    'Specifies the maximum Requests Per Second (RPS) for a bucket. To increase it to High, open a support ticket. Understand bucket rate limits.';
  const CORSNotice =
    'CORS (Cross Origin Sharing) is not available for endpoint types E2 and E3';

  // For E0/E1, confirm CORS toggle and ACL selection are both present
  // For E2/E3, confirm rate limit notice and table are present, ACL selection is present, CORS toggle is absent
  const checkBucketDetailsDrawer = (
    bucketLabel: string,
    endpointType: string
  ) => {
    ui.drawer.findByTitle(bucketLabel).within(() => {
      if (
        endpointType === 'Standard (E3)' ||
        endpointType === 'Standard (E2)'
      ) {
        cy.contains(bucketRateLimitsNotice).should('be.visible');
        cy.get('[data-testid="bucket-rate-limit-table"]').should('be.visible');
        cy.contains(CORSNotice).should('be.visible');
        ui.toggle.find().should('not.exist');
      } else {
        cy.get('[data-testid="bucket-rate-limit-table"]').should('not.exist');
        ui.toggle
          .find()
          .should('have.attr', 'data-qa-toggle', 'true')
          .should('be.visible');
        cy.contains('CORS Enabled').should('be.visible');
      }

      // Verify that all ACL selection show up as options
      cy.findByLabelText('Access Control List (ACL)')
        .should('be.visible')
        .should('have.value', 'Private')
        .click();
      ui.autocompletePopper
        .findByTitle('Public Read')
        .should('be.visible')
        .should('be.enabled');
      ui.autocompletePopper
        .findByTitle('Authenticated Read')
        .should('be.visible')
        .should('be.enabled');
      ui.autocompletePopper
        .findByTitle('Public Read/Write')
        .should('be.visible')
        .should('be.enabled');
      ui.autocompletePopper
        .findByTitle('Private')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Close the Details drawer
      cy.get('[data-qa-close-drawer="true"]').should('be.visible').click();
    });
  };

  /**
   * Confirms UI flow for creating a gen2 Object Storage bucket with endpoint E0
   * Confirms all endpoints are displayed regardless if there's multiple of the same type
   * Confirms S3 endpoint hostname displayed to differentiate between identical options in the dropdown
   * Confirms correct information displays in the details drawer for a bucket with endpoint E0
   */
  it('can create a bucket with E0 endpoint type', () => {
    const endpointTypeE0 = 'Legacy (E0)';
    const bucketLabel = randomLabel();
    const bucketCluster = 'us-iad-12';

    mockGetBuckets([]).as('getBuckets');
    mockDeleteBucket(bucketLabel, mockRegion.id).as('deleteBucket');
    mockCreateBucket({
      label: bucketLabel,
      endpoint_type: 'E0',
      cors_enabled: true,
      region: mockRegion.id,
    }).as('createBucket');

    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );

    mockGetRegions(mockRegions);
    mockGetBucketAccess(bucketLabel, bucketCluster, mockAccess).as(
      'getBucketAccess'
    );

    cy.visitWithLogin('/object-storage/buckets/create');
    cy.wait([
      '@getFeatureFlags',
      '@getBuckets',
      '@getAccount',
      '@getObjectStorageEndpoints',
    ]);

    const mockBucket = objectStorageBucketFactoryGen2.build({
      endpoint_type: 'E0',
      label: bucketLabel,
      region: mockRegion.id,
      s3_endpoint: undefined,
    });

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        cy.findByText('Label').click();
        cy.focused().type(bucketLabel);
        ui.regionSelect.find().click();
        cy.focused().type(`${mockRegion.label}{enter}`);
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

        mockGetBuckets([mockBucket]).as('getBuckets');

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
    cy.findByText(endpointTypeE0).should('be.visible');
    cy.findByText(bucketLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(mockRegion.label).should('be.visible');
        // Confirm that clicking "Details" button for the bucket opens details drawer
        ui.button.findByTitle('Details').should('be.visible').click();
      });

    checkBucketDetailsDrawer(bucketLabel, endpointTypeE0);

    // Delete the bucket to clean up
    ui.button.findByTitle('Delete').should('be.visible').click();

    ui.dialog
      .findByTitle(`Delete Bucket ${bucketLabel}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Bucket Name').click();
        cy.focused().type(bucketLabel);
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
   * Confirms UI flow for creating a gen2 Object Storage bucket with endpoint E1
   * Confirms correct information displays in the details drawer for a bucket with endpoint E1
   */
  it('can create a bucket with E1 endpoint type', () => {
    const endpointTypeE1 = 'Standard (E1)';
    const bucketLabel = randomLabel();
    const bucketCluster = 'us-iad-12';

    mockGetBuckets([]).as('getBuckets');
    mockDeleteBucket(bucketLabel, mockRegion.id).as('deleteBucket');
    mockCreateBucket({
      cors_enabled: true,
      endpoint_type: 'E1',
      label: bucketLabel,
      region: mockRegion.id,
    }).as('createBucket');

    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );

    mockGetRegions(mockRegions);
    mockGetBucketAccess(bucketLabel, bucketCluster, mockAccess).as(
      'getBucketAccess'
    );

    cy.visitWithLogin('/object-storage/buckets/create');
    cy.wait([
      '@getFeatureFlags',
      '@getBuckets',
      '@getAccount',
      '@getObjectStorageEndpoints',
    ]);

    const mockBucket = objectStorageBucketFactoryGen2.build({
      endpoint_type: 'E1',
      label: bucketLabel,
      region: mockRegion.id,
      s3_endpoint: 'us-sea-1.linodeobjects.com',
    });

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        cy.findByText('Label').click();
        cy.focused().type(bucketLabel);
        ui.regionSelect.find().click();
        cy.focused().type(`${mockRegion.label}{enter}`);
        cy.findByLabelText('Object Storage Endpoint Type')
          .should('be.visible')
          .click();

        // Select E1 endpoint
        ui.autocompletePopper
          .findByTitle('Standard (E1) us-sea-1.linodeobjects.com')
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Confirm bucket rate limits text for E1 endpoint
        cy.findByText('Bucket Rate Limits').should('be.visible');
        cy.contains(
          'This endpoint type supports up to 750 Requests Per Second (RPS). Understand bucket rate limits'
        ).should('be.visible');

        // Confirm bucket rate limit table should not exist when E1 endpoint is selected
        cy.get('[data-testid="bucket-rate-limit-table"]').should('not.exist');

        mockGetBuckets([mockBucket]).as('getBuckets');

        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm request body has expected data
    cy.wait('@createBucket').then((xhr) => {
      const requestPayload = xhr.request.body;
      expect(requestPayload['endpoint_type']).to.equal('E1');
      expect(requestPayload['cors_enabled']).to.equal(true);
      expect(requestPayload['s3_endpoint']).to.equal(
        'us-sea-1.linodeobjects.com'
      );
    });

    ui.drawer.find().should('not.exist');

    // Confirm that bucket is created, initiate deletion for cleanup
    cy.findByText(endpointTypeE1).should('be.visible');
    cy.findByText(bucketLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(mockRegion.label).should('be.visible');
        // Confirm that clicking "Details" button for the bucket opens details drawer
        ui.button.findByTitle('Details').should('be.visible').click();
      });

    checkBucketDetailsDrawer(bucketLabel, endpointTypeE1);

    // Delete the bucket to clean up
    ui.button.findByTitle('Delete').should('be.visible').click();

    ui.dialog
      .findByTitle(`Delete Bucket ${bucketLabel}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Bucket Name').click();
        cy.focused().type(bucketLabel);
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
   * Confirms correct information displays in the details drawer for a bucket with endpoint E2
   */
  it('can create a bucket with E2 endpoint type', () => {
    const endpointTypeE2 = 'Standard (E2)';
    const bucketLabel = randomLabel();
    const bucketCluster = 'us-iad-12';

    mockGetBuckets([]).as('getBuckets');
    mockDeleteBucket(bucketLabel, mockRegion.id).as('deleteBucket');
    mockCreateBucket({
      cors_enabled: true,
      endpoint_type: 'E2',
      label: bucketLabel,
      region: mockRegion.id,
    }).as('createBucket');

    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );

    mockGetRegions(mockRegions);
    mockGetBucketAccess(bucketLabel, bucketCluster, mockAccess).as(
      'getBucketAccess'
    );

    cy.visitWithLogin('/object-storage/buckets/create');
    cy.wait([
      '@getFeatureFlags',
      '@getBuckets',
      '@getAccount',
      '@getObjectStorageEndpoints',
    ]);

    const mockBucket = objectStorageBucketFactoryGen2.build({
      endpoint_type: 'E2',
      label: bucketLabel,
      region: mockRegion.id,
      s3_endpoint: undefined,
    });

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        cy.findByText('Label').click();
        cy.focused().type(bucketLabel);
        ui.regionSelect.find().click();
        cy.focused().type(`${mockRegion.label}{enter}`);
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
        cy.contains(bucketRateLimitsNotice).should('be.visible');

        // Confirm bucket rate limit table should exist when E2 endpoint is selected
        cy.get('[data-testid="bucket-rate-limit-table"]').should('exist');

        // Confirm that basic rate limits table is displayed
        checkRateLimitsTable(mockBucket.endpoint_type!);

        mockGetBuckets([mockBucket]).as('getBuckets');

        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

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
        // Confirm that clicking "Details" button for the bucket opens details drawer
        ui.button.findByTitle('Details').should('be.visible').click();
      });

    checkBucketDetailsDrawer(bucketLabel, endpointTypeE2);

    // Delete the bucket to clean up
    ui.button.findByTitle('Delete').should('be.visible').click();

    ui.dialog
      .findByTitle(`Delete Bucket ${bucketLabel}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Bucket Name').click();
        cy.focused().type(bucketLabel);
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
   * Confirms correct information displays in the details drawer for a bucket with endpoint E3
   */
  it('can create a bucket with E3 endpoint type', () => {
    const endpointTypeE3 = 'Standard (E3)';
    const bucketLabel = randomLabel();
    const bucketCluster = 'us-iad-12';

    mockGetBuckets([]).as('getBuckets');
    mockDeleteBucket(bucketLabel, mockRegion.id).as('deleteBucket');
    mockCreateBucket({
      cors_enabled: false,
      endpoint_type: 'E3',
      label: bucketLabel,
      region: mockRegion.id,
    }).as('createBucket');

    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );

    mockGetRegions(mockRegions);
    mockGetBucketAccess(bucketLabel, bucketCluster, mockAccess).as(
      'getBucketAccess'
    );

    cy.visitWithLogin('/object-storage/buckets/create');
    cy.wait([
      '@getFeatureFlags',
      '@getBuckets',
      '@getAccount',
      '@getObjectStorageEndpoints',
    ]);

    const mockBucket = objectStorageBucketFactoryGen2.build({
      endpoint_type: 'E3',
      label: bucketLabel,
      region: mockRegion.id,
      s3_endpoint: undefined,
    });

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        cy.findByText('Label').click();
        cy.focused().type(bucketLabel);
        ui.regionSelect.find().click();
        cy.focused().type(`${mockRegion.label}{enter}`);
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
        cy.contains(bucketRateLimitsNotice).should('be.visible');

        // Confirm bucket rate limit table should exist when E3 endpoint is selected
        cy.get('[data-testid="bucket-rate-limit-table"]').should('exist');

        // Confirm that basic rate limits table is displayed
        checkRateLimitsTable(mockBucket.endpoint_type!);

        mockGetBuckets([mockBucket]).as('getBuckets');

        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

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
        // Confirm that clicking "Details" button for the bucket opens details drawer
        ui.button.findByTitle('Details').should('be.visible').click();
      });

    checkBucketDetailsDrawer(bucketLabel, endpointTypeE3);

    // Delete the bucket to clean up
    ui.button.findByTitle('Delete').should('be.visible').click();
    ui.dialog
      .findByTitle(`Delete Bucket ${bucketLabel}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Bucket Name').click();
        cy.focused().type(bucketLabel);
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
   * Confirms UI flow for when creating a bucket results in validation and API errors
   * - Confirms trying to create a bucket without an endpoint leads to a validation error that later disappears when an endpoint is specified
   * - Confirms trying to create a bucket without a label leads to a validation error that later disappears when a label is specified
   * - Confirms an error returned by the API is displayed and does not crash Cloud Manager
   */
  it('handles errors and validation', () => {
    const bucketLabel = randomLabel();
    const mockErrorMessage = 'An unknown error has occurred.';
    mockGetBuckets([]).as('getBuckets');
    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );
    mockGetRegions(mockRegions);
    mockCreateBucketError(mockErrorMessage).as('createBucket');

    cy.visitWithLogin('/object-storage/buckets/create');
    cy.wait([
      '@getFeatureFlags',
      '@getAccount',
      '@getBuckets',
      '@getObjectStorageEndpoints',
    ]);

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        ui.regionSelect.find().click().type(`${mockRegion.label}{enter}`);

        // Confirms error appears when an endpoint isn't selected, and disappears after one is selected
        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.contains('Endpoint Type is required.').should('be.visible');

        cy.findByLabelText('Object Storage Endpoint Type')
          .should('be.visible')
          .click();

        ui.autocompletePopper
          .findByTitle('Standard (E3)')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.contains('Endpoint Type is required.').should('not.exist');

        // confirms error appears when label isn't filled in and disappears once a label is entered
        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.contains('Label is required.').should('be.visible');
        cy.findByText('Label').click();
        cy.focused().type(bucketLabel);
        cy.contains('Label is required.').should('not.exist');

        // confirms (mock) API error appears
        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.wait('@createBucket');
        cy.findByText(mockErrorMessage).should('be.visible');
      });
  });
});

/**
 * When a restricted user navigates to object-storage/buckets/create, an error is shown in the "Create Bucket" drawer noting that the user does not have bucket creation permissions
 */
describe('Object Storage Gen2 create bucket modal has disabled fields for restricted user', () => {
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
    // restricted user
    mockGetProfile(
      profileFactory.build({
        email: 'mock-user@linode.com',
        restricted: true,
      })
    ).as('getProfile');
  });

  // bucket creation
  it('create bucket form', () => {
    cy.visitWithLogin('/object-storage/buckets/create');
    cy.wait(['@getFeatureFlags', '@getAccount', '@getProfile']);

    // error message
    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        cy.findByText(/You don't have permissions to create a Bucket./).should(
          'be.visible'
        );
        cy.findByLabelText(/Label.*/)
          .should('be.visible')
          .should('be.disabled');
        ui.regionSelect.find().should('be.visible').should('be.disabled');
        // submit button should be disabled
        cy.findByTestId('create-bucket-button')
          .should('be.visible')
          .should('be.disabled');
      });
  });
});
