import 'cypress-file-upload';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  accountFactory,
  objectStorageBucketFactoryGen2,
  objectStorageEndpointsFactory,
  regionFactory,
} from 'src/factories';
import { chooseRegion } from 'support/util/regions';
import { ObjectStorageEndpoint } from '@linode/api-v4';
import { randomItem, randomLabel } from 'support/util/random';
import {
  mockCreateBucket,
  mockGetBucket,
  mockGetBucketObjectFilename,
  mockGetBucketObjects,
  mockGetBucketsForRegion,
  mockGetObjectStorageEndpoints,
  mockUploadBucketObject,
  mockUploadBucketObjectS3,
} from 'support/intercepts/object-storage';
import { ui } from 'support/ui';

describe('Object Storage Gen2 bucket object tests', () => {
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
  const mockRegions = regionFactory.buildList(5, {
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

  const bucketFile = randomItem([
    'object-storage-files/1.txt',
    'object-storage-files/2.jpg',
    'object-storage-files/3.jpg',
    'object-storage-files/4.zip',
  ]);

  const bucketFilename = bucketFile.split('/')[1];

  const ACLNotification = 'Private: Only you can download this Object';

  // For E0/E1, confirm CORS toggle and ACL selection are both present
  // For E2/E3, confirm ACL and Cors are removed
  const checkBucketObjectDetailsDrawer = (
    bucketFilename: string,
    endpointType: string
  ) => {
    ui.drawer.findByTitle(bucketFilename).within(() => {
      if (
        endpointType === 'Standard (E3)' ||
        endpointType === 'Standard (E2)'
      ) {
        ui.toggle.find().should('not.exist');
        cy.contains('CORS Enabled').should('not.exist');
        cy.findByLabelText('Access Control List (ACL)').should('not.exist');
      } else {
        ui.toggle
          .find()
          .should('have.attr', 'data-qa-toggle', 'true')
          .should('be.visible');
        cy.contains('CORS Enabled').should('be.visible');

        cy.contains(ACLNotification).should('not.exist');
        // Verify that ACL selection show up as options
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
          .findByTitle('Private')
          .should('be.visible')
          .should('be.enabled')
          .click();
      }
      // Close the Details drawer
      cy.get('[data-qa-close-drawer="true"]').should('be.visible').click();
    });
  };

  /**
  
     */
  it('can check Object details drawer with E0 endpoint type', () => {
    const endpointTypeE0 = 'Legacy (E0)';
    const bucketLabel = randomLabel();
    const bucketCluster = mockRegion.id;
    const mockBucket = objectStorageBucketFactoryGen2.build({
      label: bucketLabel,
      region: mockRegion.id,
      endpoint_type: 'E0',
      s3_endpoint: undefined,
    });

    //mockGetBuckets([]).as('getBuckets');
    mockCreateBucket({
      label: bucketLabel,
      endpoint_type: 'E0',
      cors_enabled: true,
      region: mockRegion.id,
    }).as('createBucket');
    mockGetBucketsForRegion(mockRegion.id, [mockBucket]).as('getBuckets');
    mockGetBucketObjects(bucketLabel, bucketCluster, []).as('getBucketObjects');
    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );
    mockUploadBucketObject(bucketLabel, bucketCluster, bucketFilename).as(
      'uploadBucketObject'
    );
    mockUploadBucketObjectS3(bucketLabel, bucketCluster, bucketFilename).as(
      'uploadBucketObjectS3'
    );
    mockGetBucketObjectFilename(bucketLabel, bucketCluster, bucketFilename).as(
      'getBucketFilename'
    );

    cy.visitWithLogin(
      `/object-storage/buckets/${bucketCluster}/${bucketLabel}`
    );

    cy.fixture(bucketFile, null).then((bucketFileContents) => {
      cy.get('[data-qa-drop-zone="true"]').attachFile(
        {
          fileContent: bucketFileContents,
          fileName: bucketFilename,
        },
        {
          subjectType: 'drag-n-drop',
        }
      );
    });

    cy.wait(['@uploadBucketObject', '@uploadBucketObjectS3']);

    cy.findByLabelText('List of Bucket Objects').within(() => {
      cy.findByText(bucketFilename).should('be.visible').click();
    });

    ui.drawer.findByTitle(bucketFilename).should('be.visible');

    checkBucketObjectDetailsDrawer(bucketFilename, endpointTypeE0);
  });

  it('can check Object details drawer with E1 endpoint type', () => {
    const endpointTypeE1 = 'Standard (E1)';
    const bucketLabel = randomLabel();
    const bucketCluster = mockRegion.id;
    const mockBucket = objectStorageBucketFactoryGen2.build({
      label: bucketLabel,
      region: mockRegion.id,
      endpoint_type: 'E1',
      s3_endpoint: 'us-sea-1.linodeobjects.com',
    });

    //mockGetBuckets([]).as('getBuckets');
    mockCreateBucket({
      label: bucketLabel,
      endpoint_type: 'E1',
      cors_enabled: true,
      region: mockRegion.id,
    }).as('createBucket');
    mockGetBucketsForRegion(mockRegion.id, [mockBucket]).as('getBuckets');
    mockGetBucketObjects(bucketLabel, bucketCluster, []).as('getBucketObjects');
    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );
    mockUploadBucketObject(bucketLabel, bucketCluster, bucketFilename).as(
      'uploadBucketObject'
    );
    mockUploadBucketObjectS3(bucketLabel, bucketCluster, bucketFilename).as(
      'uploadBucketObjectS3'
    );
    mockGetBucketObjectFilename(bucketLabel, bucketCluster, bucketFilename).as(
      'getBucketFilename'
    );

    cy.visitWithLogin(
      `/object-storage/buckets/${bucketCluster}/${bucketLabel}`
    );

    cy.fixture(bucketFile, null).then((bucketFileContents) => {
      cy.get('[data-qa-drop-zone="true"]').attachFile(
        {
          fileContent: bucketFileContents,
          fileName: bucketFilename,
        },
        {
          subjectType: 'drag-n-drop',
        }
      );
    });

    cy.wait(['@uploadBucketObject', '@uploadBucketObjectS3']);

    cy.findByLabelText('List of Bucket Objects').within(() => {
      cy.findByText(bucketFilename).should('be.visible').click();
    });

    ui.drawer.findByTitle(bucketFilename).should('be.visible');

    checkBucketObjectDetailsDrawer(bucketFilename, endpointTypeE1);
  });

  it('can check Object details drawer with E2 endpoint type', () => {
    const endpointTypeE2 = 'Standard (E2)';
    const bucketLabel = randomLabel();
    const bucketCluster = mockRegion.id;
    const mockBucket = objectStorageBucketFactoryGen2.build({
      label: bucketLabel,
      region: mockRegion.id,
      endpoint_type: 'E2',
      s3_endpoint: undefined,
    });

    mockCreateBucket({
      label: bucketLabel,
      endpoint_type: 'E2',
      cors_enabled: true,
      region: mockRegion.id,
    }).as('createBucket');
    mockGetBucketsForRegion(mockRegion.id, [mockBucket]).as('getBuckets');
    mockGetBucketObjects(bucketLabel, bucketCluster, []).as('getBucketObjects');
    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );
    mockUploadBucketObject(bucketLabel, bucketCluster, bucketFilename).as(
      'uploadBucketObject'
    );
    mockUploadBucketObjectS3(bucketLabel, bucketCluster, bucketFilename).as(
      'uploadBucketObjectS3'
    );
    mockGetBucketObjectFilename(bucketLabel, bucketCluster, bucketFilename).as(
      'getBucketFilename'
    );
    mockGetBucket(bucketLabel, bucketCluster).as('getBucket');

    cy.visitWithLogin(
      `/object-storage/buckets/${bucketCluster}/${bucketLabel}`
    );

    cy.fixture(bucketFile, null).then((bucketFileContents) => {
      cy.get('[data-qa-drop-zone="true"]').attachFile(
        {
          fileContent: bucketFileContents,
          fileName: bucketFilename,
        },
        {
          subjectType: 'drag-n-drop',
        }
      );
    });

    cy.wait(['@uploadBucketObject', '@uploadBucketObjectS3']);

    cy.findByLabelText('List of Bucket Objects').within(() => {
      cy.findByText(bucketFilename).should('be.visible').click();
    });

    ui.drawer.findByTitle(bucketFilename).should('be.visible');

    checkBucketObjectDetailsDrawer(bucketFilename, endpointTypeE2);
  });

  it('can check Object details drawer with E3 endpoint type', () => {
    const endpointTypeE3 = 'Standard (E3)';
    const bucketLabel = randomLabel();
    const bucketCluster = mockRegion.id;
    const mockBucket = objectStorageBucketFactoryGen2.build({
      label: bucketLabel,
      region: mockRegion.id,
      endpoint_type: 'E3',
      s3_endpoint: undefined,
    });

    mockCreateBucket({
      label: bucketLabel,
      endpoint_type: 'E3',
      cors_enabled: true,
      region: mockRegion.id,
    }).as('createBucket');
    mockGetBucketsForRegion(mockRegion.id, [mockBucket]).as('getBuckets');
    mockGetBucketObjects(bucketLabel, bucketCluster, []).as('getBucketObjects');
    mockGetObjectStorageEndpoints(mockEndpoints).as(
      'getObjectStorageEndpoints'
    );
    mockUploadBucketObject(bucketLabel, bucketCluster, bucketFilename).as(
      'uploadBucketObject'
    );
    mockUploadBucketObjectS3(bucketLabel, bucketCluster, bucketFilename).as(
      'uploadBucketObjectS3'
    );
    mockGetBucketObjectFilename(bucketLabel, bucketCluster, bucketFilename).as(
      'getBucketFilename'
    );
    mockGetBucket(bucketLabel, bucketCluster).as('getBucket');

    cy.visitWithLogin(
      `/object-storage/buckets/${bucketCluster}/${bucketLabel}`
    );

    cy.fixture(bucketFile, null).then((bucketFileContents) => {
      cy.get('[data-qa-drop-zone="true"]').attachFile(
        {
          fileContent: bucketFileContents,
          fileName: bucketFilename,
        },
        {
          subjectType: 'drag-n-drop',
        }
      );
    });

    cy.wait(['@uploadBucketObject', '@uploadBucketObjectS3']);

    cy.findByLabelText('List of Bucket Objects').within(() => {
      cy.findByText(bucketFilename).should('be.visible').click();
    });

    ui.drawer.findByTitle(bucketFilename).should('be.visible');

    checkBucketObjectDetailsDrawer(bucketFilename, endpointTypeE3);
  });
});
