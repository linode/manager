import { regionFactory } from '@linode/utilities';
import 'cypress-file-upload';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateBucket,
  mockGetBucket,
  mockGetBucketObjectFilename,
  mockGetBucketObjects,
  mockGetBucketsForRegion,
  mockGetBucketsForRegionError,
  mockGetObjectStorageEndpoints,
  mockUploadBucketObject,
  mockUploadBucketObjectS3,
} from 'support/intercepts/object-storage';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomItem, randomLabel } from 'support/util/random';
import { extendRegion } from 'support/util/regions';
import { chooseRegion } from 'support/util/regions';

import {
  accountFactory,
  objectStorageBucketFactoryGen2,
  objectStorageEndpointsFactory,
} from 'src/factories';

import type { ObjectStorageEndpoint } from '@linode/api-v4';

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

  // For E0/E1, ACL selection is present
  // For E2/E3, confirm ACL is removed
  const checkBucketObjectDetailsDrawer = (
    bucketFilename: string,
    endpointType: string
  ) => {
    ui.drawer.findByTitle(bucketFilename).within(() => {
      if (
        endpointType === 'Standard (E3)' ||
        endpointType === 'Standard (E2)'
      ) {
        cy.findByLabelText('Access Control List (ACL)').should('not.exist');
      } else {
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

  it('displays successfully fetched buckets, warning message for single failed fetch', () => {
    const mockRegions = regionFactory
      .buildList(2, {
        capabilities: ['Object Storage'],
      })
      .map((region) => extendRegion(region));
    mockGetRegions(mockRegions).as('getRegions');
    const mockEndpoints = mockRegions.map((mockRegion) => {
      return objectStorageEndpointsFactory.build({
        endpoint_type: 'E2',
        region: mockRegion.id,
        s3_endpoint: `${mockRegion.id}.linodeobjects.com`,
      });
    });

    mockGetObjectStorageEndpoints(mockEndpoints).as('getEndpoints');
    const mockBucket1 = objectStorageBucketFactoryGen2.build({
      label: randomLabel(),
      region: mockRegions[0].id,
    });
    // this bucket should display
    mockGetBucketsForRegion(mockRegions[0].id, [mockBucket1]).as(
      'getBucketsForRegion'
    );
    mockGetBucketsForRegionError(mockRegions[1].id).as(
      'getBucketsForRegionError'
    );

    cy.visitWithLogin('/object-storage/buckets');
    cy.wait([
      '@getRegions',
      '@getEndpoints',
      '@getBucketsForRegion',
      '@getBucketsForRegionError',
    ]);
    // table with retrieved bucket
    cy.findByText(mockBucket1.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(mockRegions[0].label).should('be.visible');
      });
    // warning message
    cy.findByTestId('notice-warning-important').within(() => {
      cy.contains(
        `There was an error loading buckets in ${mockRegions[1].label}`
      );
    });
    cy.contains(
      `If you have buckets in ${mockRegions[1].label}, you may not see them listed below.`
    );
  });

  it('displays successfully fetched buckets, warning message for multiple failed fetches', () => {
    const mockRegions = regionFactory.buildList(3, {
      capabilities: ['Object Storage'],
    });
    mockGetRegions(mockRegions).as('getRegions');
    const mockEndpoints = mockRegions.map((mockRegion) => {
      return objectStorageEndpointsFactory.build({
        endpoint_type: 'E2',
        region: mockRegion.id,
        s3_endpoint: `${mockRegion.id}.linodeobjects.com`,
      });
    });

    mockGetObjectStorageEndpoints(mockEndpoints).as('getEndpoints');
    const mockBucket1 = objectStorageBucketFactoryGen2.build({
      label: randomLabel(),
      region: mockRegions[0].id,
    });
    // this bucket should display
    mockGetBucketsForRegion(mockRegions[0].id, [mockBucket1]).as(
      'getBucketsForRegion'
    );
    // force errors for 2 regions' buckets
    mockGetBucketsForRegionError(mockRegions[1].id).as(
      'getBucketsForRegionError0'
    );
    mockGetBucketsForRegionError(mockRegions[2].id).as(
      'getBucketsForRegionError1'
    );
    cy.visitWithLogin('/object-storage/buckets');
    cy.wait([
      '@getRegions',
      '@getEndpoints',
      '@getBucketsForRegion',
      '@getBucketsForRegionError0',
      '@getBucketsForRegionError1',
    ]);
    // table with retrieved bucket
    cy.get('table tbody tr').should('have.length', 1);
    // warning message
    cy.findByTestId('notice-warning-important').within(() => {
      cy.contains(
        'There was an error loading buckets in the following regions:'
      );
      const strError1 = `${mockRegions[1].country.toUpperCase()}, ${
        mockRegions[1].label
      }`;
      const strError2 = `${mockRegions[2].country.toUpperCase()}, ${
        mockRegions[2].label
      }`;
      cy.get('ul>li').eq(0).contains(strError1);
      cy.get('ul>li').eq(1).contains(strError2);
      // bottom of warning message
      cy.contains(
        'If you have buckets in these regions, you may not see them listed below.'
      );
    });
  });
});
