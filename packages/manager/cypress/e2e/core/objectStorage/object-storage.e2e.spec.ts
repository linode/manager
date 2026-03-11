/**
 * @file End-to-end tests for Object Storage operations.
 */

import { createBucket } from '@linode/api-v4/lib/object-storage';
import { getNewRegionLabel } from '@linode/utilities';
import { authenticate } from 'support/api/authentication';
import {
  interceptGetNetworkUtilization,
  mockGetAccount,
} from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  interceptCreateBucket,
  interceptDeleteBucket,
  interceptGetBucketAccess,
  interceptGetBuckets,
  interceptUpdateBucketAccess,
} from 'support/intercepts/object-storage';
import { interceptGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { chooseCluster } from 'support/util/clusters';
import { randomLabel } from 'support/util/random';
import { getRegionById } from 'support/util/regions';

import {
  accountFactory,
  createObjectStorageBucketFactoryLegacy,
} from 'src/factories';

import type { Region } from '@linode/api-v4/lib/object-storage';

/**
 * Create a bucket with the given label and cluster.
 *
 * This function assumes that OBJ Multicluster is not enabled. Use
 * `setUpBucketMulticluster` to set up OBJ buckets when Multicluster is enabled.
 *
 * @param label - Bucket label.
 * @param cluster - Bucket cluster.
 * @param cors_enabled - Enable CORS on the bucket: defaults to true for Gen1 and false for Gen2.
 *
 * @returns Promise that resolves to created Bucket.
 */
const setUpBucket = (
  label: string,
  region: string,
  cors_enabled: boolean = true
) => {
  return createBucket(
    createObjectStorageBucketFactoryLegacy.build({
      region,
      cors_enabled,
      label,

      // API accepts either `cluster` or `region`, but not both. Our factory
      // populates both fields, so we have to manually set `cluster` to `undefined`
      // to avoid 400 responses from the API.
      cluster: undefined,
    })
  );
};

const setupBuckets = (bucketsDetails: { label: string; region: string }[]) => {
  return Promise.all(
    bucketsDetails.map(({ label, region }) => setUpBucket(label, region))
  );
};

authenticate();
beforeEach(() => {
  cy.tag('method:e2e');
});
describe('object storage end-to-end tests', () => {
  before(() => {
    cleanUp('obj-buckets');
  });

  /*
   * - Tests object bucket creation flow using real API responses.
   * - Confirms that bucket can be created.
   * - Confirms new bucket is listed on landing page.
   * - Confirms that empty buckets can be deleted.
   * - Confirms that deleted buckets are no longer listed on landing page.
   */
  it('can create and delete object storage buckets', () => {
    cy.tag('purpose:syntheticTesting');
    const bucketLabel = randomLabel();
    const bucketClusterObj = chooseCluster();
    const bucketRegion = getRegionById(bucketClusterObj.region);
    let bucketHostname: string;
    interceptGetBuckets().as('getBuckets');
    interceptCreateBucket().as('createBucket');
    interceptDeleteBucket(bucketLabel, bucketRegion.id).as('deleteBucket');
    interceptGetNetworkUtilization().as('getNetworkUtilization');

    mockGetAccount(accountFactory.build({ capabilities: ['Object Storage'] }));
    mockAppendFeatureFlags({
      objMultiCluster: false,
      objectStorageGen2: { enabled: false },
    }).as('getFeatureFlags');

    cy.visitWithLogin('/object-storage/buckets');
    cy.wait(['@getFeatureFlags', '@getBuckets', '@getNetworkUtilization']);

    // Wait for loader to disappear, indicating that all buckets have been loaded.
    // Mitigates test failures stemming from M3-7833.
    cy.findByTestId('Buckets').within(() => {
      cy.findByLabelText('Content is loading').should('not.exist');
    });

    ui.button.findByTitle('Create Bucket').should('be.visible').click();

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Bucket Name (required)').click();
        cy.focused().type(bucketLabel);
        ui.regionSelect.find().click();
        cy.focused().type(`${bucketRegion.label}{enter}`);

        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .click();
      });

    cy.wait(['@createBucket', '@getBuckets']).then(([createBucket]) => {
      bucketHostname = createBucket?.response?.body?.hostname;
    });
    ui.drawer.find().should('not.exist');

    // Confirm that bucket is created, initiate deletion.
    cy.findByText(bucketLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(bucketRegion.label).should('be.visible');
        cy.findByText(bucketHostname).should('be.visible');
        ui.button.findByTitle('Delete').should('be.visible').click();
      });

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

    // Confirm that deletion succeeds.
    cy.wait('@deleteBucket').its('response.statusCode').should('eq', 200);
    cy.findByText(bucketLabel).should('not.exist');
  });

  /*
   * - Confirms that user can update Bucket access.
   * - Confirms user can switch bucket access from Private to Public Read.
   * - Confirms that toast notification appears confirming operation.
   */
  it('can update bucket access', () => {
    const bucketLabel = randomLabel();
    const bucketClusterObj = chooseCluster();
    const bucketRegion = bucketClusterObj.region;
    const bucketAccessPage = `/object-storage/buckets/${bucketRegion}/${bucketLabel}/access`;

    cy.defer(
      () => setUpBucket(bucketLabel, bucketRegion),
      'creating Object Storage bucket'
    ).then(() => {
      interceptGetBucketAccess(bucketLabel, bucketRegion).as('getBucketAccess');
      interceptUpdateBucketAccess(bucketLabel, bucketRegion).as(
        'updateBucketAccess'
      );

      // Navigate to new bucket page, upload and delete an object.
      cy.visitWithLogin(bucketAccessPage);

      cy.wait('@getBucketAccess');

      // Make object public, confirm it can be accessed.
      cy.findByLabelText('Access Control List (ACL)')
        .should('be.visible')
        .should('not.have.value', 'Loading access...')
        .should('have.value', 'Private')
        .click();
      cy.focused().type('Public Read');

      ui.autocompletePopper
        .findByTitle('Public Read')
        .should('be.visible')
        .click();

      ui.button.findByTitle('Save').should('be.visible').click();

      // TODO Confirm that outgoing API request contains expected values.
      cy.wait('@updateBucketAccess');

      cy.findByText('Bucket access updated successfully.');
    });
  });

  /*
   * - Confirms that user can filter bucket list by region.
   */
  it('can filter the list of buckets by region', () => {
    interceptGetBuckets().as('getBuckets');
    interceptGetRegions().as('getRegions');

    const bucketsDetails = new Array(2).fill({}).map((_, index) => ({
      label: randomLabel(),
      region: index === 0 ? 'us-ord' : 'us-lax',
    }));

    cy.defer(
      () => setupBuckets(bucketsDetails),
      'creating Object Storage bucket'
    ).then(() => {
      cy.visitWithLogin('/object-storage/buckets');
      cy.wait(['@getBuckets', '@getRegions']).then(([_, { response }]) => {
        const regions: Region[] = response?.body.data;

        const selectedBucket = bucketsDetails[0];
        const selectedRegion = regions.find(
          (region) => region.id === selectedBucket.region
        );

        expect(
          selectedRegion,
          `expected region matching ${selectedBucket.region}`
        ).to.exist;

        const selectedRegionLabel = selectedRegion
          ? getNewRegionLabel(selectedRegion)
          : '';

        const regionSelect = ui.autocomplete
          .findByLabel('Region')
          .should('be.visible')
          .type(selectedRegionLabel);

        ui.autocompletePopper
          .findByTitle(selectedRegionLabel, { exact: false })
          .should('be.visible')
          .click();

        regionSelect.click();

        cy.get('tbody').within(() => {
          cy.get('tr')
            .should('have.length', 1)
            .within(() => {
              cy.findByText(selectedBucket.label).should('be.visible');
            });
        });
      });
    });
  });

  /*
   * - Confirms that user can filter bucket list by endpoint.
   */
  it('can filter the list of buckets by endpoint', () => {
    interceptGetBuckets().as('getBuckets');
    interceptGetRegions().as('getRegions');

    const bucketsDetails = new Array(2).fill({}).map((_, index) => ({
      label: randomLabel(),
      region: index === 0 ? 'us-ord' : 'us-lax',
    }));

    cy.defer(
      () => setupBuckets(bucketsDetails),
      'creating Object Storage bucket'
    ).then(() => {
      cy.visitWithLogin('/object-storage/buckets');
      cy.wait(['@getBuckets', '@getRegions']);

      const selectedBucket = bucketsDetails[0];
      const selectedBucketRegion = selectedBucket.region;

      const endpointSelect = ui.autocomplete.findByLabel('Endpoint');
      endpointSelect.should('be.visible').type(selectedBucketRegion);
      ui.autocompletePopper
        .findByTitle(selectedBucketRegion, { exact: false })
        .should('be.visible')
        .click();
      endpointSelect.click();

      cy.get('tbody').within(() => {
        cy.get('tr')
          .should('have.length', 1)
          .within(() => {
            cy.findByText(selectedBucket.label).should('be.visible');
          });
      });
    });
  });

  /*
   * - Confirms that when region is selected, endpoint multiselect.
   * shows only endpoints related to the selected region.
   */
  it('should filter list of endpoints when region is selected', () => {
    interceptGetBuckets().as('getBuckets');
    interceptGetRegions().as('getRegions');

    const bucketsDetails = new Array(2).fill({}).map((_, index) => ({
      label: randomLabel(),
      region: index === 0 ? 'us-ord' : 'us-lax',
    }));

    cy.defer(
      () => setupBuckets(bucketsDetails),
      'creating Object Storage bucket'
    ).then(() => {
      cy.visitWithLogin('/object-storage/buckets');
      cy.wait(['@getBuckets', '@getRegions']).then(([_, { response }]) => {
        const regions: Region[] = response?.body.data;

        const selectedBucket = bucketsDetails[0];
        const selectedRegion = regions.find(
          (region) => region.id === selectedBucket.region
        );

        expect(
          selectedRegion,
          `expected region matching ${selectedBucket.region}`
        ).to.exist;

        const selectedRegionLabel = selectedRegion
          ? getNewRegionLabel(selectedRegion)
          : '';

        const regionSelect = ui.autocomplete
          .findByLabel('Region')
          .should('be.visible')
          .type(selectedRegionLabel);
        ui.autocompletePopper
          .findByTitle(selectedRegionLabel, { exact: false })
          .should('be.visible')
          .click();
        regionSelect.click();

        ui.autocomplete.findByLabel('Endpoint').should('be.visible').click();

        ui.autocompletePopper
          .findByTitle(new RegExp('^.*-.*-.*\..*.'))
          .should('have.length', 1);
      });
    });
  });
});
