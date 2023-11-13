/**
 * @file End-to-end tests for Object Storage operations.
 */

import 'cypress-file-upload';
import { createBucket } from '@linode/api-v4/lib/object-storage';
import { objectStorageBucketFactory } from 'src/factories';
import { authenticate } from 'support/api/authentication';
import {
  interceptCreateBucket,
  interceptDeleteBucket,
  interceptGetBuckets,
  interceptUploadBucketObjectS3,
} from 'support/intercepts/object-storage';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import { cleanUp } from 'support/util/cleanup';

// Message shown on-screen when user navigates to an empty bucket.
const emptyBucketMessage = 'This bucket is empty.';

// Message shown on-screen when user navigates to an empty folder.
const emptyFolderMessage = 'This folder is empty.';

/**
 * Returns the non-empty bucket error message for a bucket with the given label.
 *
 * This message appears when attempting to delete a bucket that has one or
 * more objects.
 *
 * @param bucketLabel - Label of bucket being deleted.
 *
 * @returns Non-empty bucket error message.
 */
const getNonEmptyBucketMessage = (bucketLabel: string) => {
  return `Bucket ${bucketLabel} is not empty. Please delete all objects and try again.`;
};

/**
 * Create a bucket with the given label and cluster.
 *
 * @param label - Bucket label.
 * @param cluster - Bucket cluster.
 *
 * @returns Promise that resolves to created Bucket.
 */
const setUpBucket = (label: string, cluster: string) => {
  return createBucket(objectStorageBucketFactory.build({ label, cluster }));
};

/**
 * Uploads the file at the given path and assigns it the given filename.
 *
 * This assumes that Cypress has already navigated to a page where a file
 * upload prompt is present.
 *
 * @param filepath - Path to file to upload.
 * @param filename - Filename to assign to uploaded file.
 */
const uploadFile = (filepath: string, filename: string) => {
  cy.fixture(filepath, null).then((contents) => {
    cy.get('[data-qa-drop-zone]').attachFile(
      {
        fileContent: contents,
        fileName: filename,
      },
      {
        subjectType: 'drag-n-drop',
      }
    );
  });
};

/**
 * Asserts that a URL assigned to an alias responds with a given status code.
 *
 * @param urlAlias - Cypress alias containing the URL to request.
 * @param expectedStatus - HTTP status to expect for URL.
 */
const assertStatusForUrlAtAlias = (
  urlAlias: string,
  expectedStatus: number
) => {
  cy.get(urlAlias).then((url: unknown) => {
    // An alias can resolve to anything. We're assuming the user passed a valid
    // alias which resolves to a string.
    cy.request({
      url: url as string,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(expectedStatus);
    });
  });
};

authenticate();
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
    const bucketLabel = randomLabel();
    const bucketRegion = 'Atlanta, GA';
    const bucketCluster = 'us-southeast-1';
    const bucketHostname = `${bucketLabel}.${bucketCluster}.linodeobjects.com`;

    interceptGetBuckets().as('getBuckets');
    interceptCreateBucket().as('createBucket');
    interceptDeleteBucket(bucketLabel, bucketCluster).as('deleteBucket');

    cy.visitWithLogin('/object-storage');
    cy.wait('@getBuckets');

    ui.button.findByTitle('Create Bucket').should('be.visible').click();

    ui.drawer
      .findByTitle('Create Bucket')
      .should('be.visible')
      .within(() => {
        cy.findByText('Label').click().type(bucketLabel);
        ui.regionSelect.find().click().type(`${bucketRegion}{enter}`);

        ui.buttonGroup
          .findButtonByTitle('Create Bucket')
          .should('be.visible')
          .click();
      });

    cy.wait(['@createBucket', '@getBuckets']);

    // Confirm that bucket is created, initiate deletion.
    cy.findByText(bucketLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(bucketRegion).should('be.visible');
        cy.findByText(bucketHostname).should('be.visible');
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

    // Confirm that deletion succeeds.
    cy.wait('@deleteBucket').its('response.statusCode').should('eq', 200);
    cy.findByText(bucketLabel).should('not.exist');
  });

  /*
   * - Confirms that users can upload new objects.
   * - Confirms that users can replace objects with identical filenames.
   * - Confirms that users can delete objects.
   * - Confirms that users can create folders.
   * - Confirms that users can delete empty folders.
   * - Confirms that users cannot delete folders with objects.
   * - Confirms that users cannot delete buckets with objects.
   * - Confirms that private objects cannot be accessed over HTTP.
   * - Confirms that public objects can be accessed over HTTP.
   */
  it('can upload, access, and delete objects', () => {
    const bucketLabel = randomLabel();
    const bucketCluster = 'us-southeast-1';
    const bucketPage = `/object-storage/buckets/${bucketCluster}/${bucketLabel}/objects`;
    const bucketFolderName = randomLabel();

    const bucketFiles = [
      { path: 'object-storage-files/1.txt', name: '1.txt' },
      { path: 'object-storage-files/2.jpg', name: '2.jpg' },
    ];

    cy.defer(
      setUpBucket(bucketLabel, bucketCluster),
      'creating Object Storage bucket'
    ).then(() => {
      interceptUploadBucketObjectS3(
        bucketLabel,
        bucketCluster,
        bucketFiles[0].name
      ).as('uploadObject');

      // Navigate to new bucket page, upload and delete an object.
      cy.visitWithLogin(bucketPage);
      ui.entityHeader.find().within(() => {
        cy.findByText(bucketLabel).should('be.visible');
      });

      uploadFile(bucketFiles[0].path, bucketFiles[0].name);

      // @TODO Investigate why files do not appear automatically in Cypress.
      cy.wait('@uploadObject');
      cy.reload();

      cy.findByLabelText(bucketFiles[0].name).should('be.visible');
      ui.button.findByTitle('Delete').should('be.visible').click();

      ui.dialog
        .findByTitle(`Delete ${bucketFiles[0].name}`)
        .should('be.visible')
        .within(() => {
          ui.buttonGroup
            .findButtonByTitle('Delete')
            .should('be.visible')
            .click();
        });

      cy.findByText(emptyBucketMessage).should('be.visible');
      cy.findByText(bucketFiles[0].name).should('not.exist');

      // Create a folder, navigate into it and upload object.
      ui.button.findByTitle('Create Folder').should('be.visible').click();

      ui.drawer
        .findByTitle('Create Folder')
        .should('be.visible')
        .within(() => {
          cy.findByLabelText('Folder Name')
            .should('be.visible')
            .click()
            .type(bucketFolderName);

          ui.buttonGroup
            .findButtonByTitle('Create')
            .should('be.visible')
            .click();
        });

      cy.findByText(bucketFolderName).should('be.visible').click();

      cy.findByText(emptyFolderMessage).should('be.visible');
      interceptUploadBucketObjectS3(
        bucketLabel,
        bucketCluster,
        `${bucketFolderName}/${bucketFiles[1].name}`
      ).as('uploadObject');
      uploadFile(bucketFiles[1].path, bucketFiles[1].name);
      cy.wait('@uploadObject');

      // Re-upload file to confirm replace prompt behavior.
      uploadFile(bucketFiles[1].path, bucketFiles[1].name);
      cy.findByText(
        'This file already exists. Are you sure you want to overwrite it?'
      );
      ui.button.findByTitle('Replace').should('be.visible').click();
      cy.wait('@uploadObject');

      // Confirm that you cannot delete a bucket with objects in it.
      cy.visitWithLogin('/object-storage/buckets');
      cy.findByText(bucketLabel)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          ui.button.findByTitle('Delete').should('be.visible').click();
        });

      ui.dialog
        .findByTitle(`Delete Bucket ${bucketLabel}`)
        .should('be.visible')
        .within(() => {
          cy.findByText('Bucket Name').click().type(bucketLabel);

          ui.buttonGroup
            .findButtonByTitle('Delete')
            .should('be.visible')
            .should('be.enabled')
            .click();

          cy.findByText(getNonEmptyBucketMessage(bucketLabel)).should(
            'be.visible'
          );
        });

      // Confirm that you cannot delete a folder with objects in it.
      cy.visitWithLogin(bucketPage);
      ui.button.findByTitle('Delete').should('be.visible').click();

      ui.dialog
        .findByTitle(`Delete ${bucketFolderName}`)
        .should('be.visible')
        .within(() => {
          ui.button.findByTitle('Delete').should('be.visible').click();

          cy.findByText('The folder must be empty to delete it.').should(
            'be.visible'
          );

          ui.button.findByTitle('Cancel').should('be.visible').click();
        });

      // Confirm public/private access controls work as expected.
      cy.findByText(bucketFolderName).should('be.visible').click();
      cy.findByText(bucketFiles[1].name).should('be.visible').click();

      ui.drawer
        .findByTitle(`${bucketFolderName}/${bucketFiles[1].name}`)
        .should('be.visible')
        .within(() => {
          // Confirm that object is not public by default.
          cy.get('[data-testid="external-site-link"]')
            .should('be.visible')
            .invoke('attr', 'href')
            .as('bucketObjectUrl');

          assertStatusForUrlAtAlias('@bucketObjectUrl', 403);

          // Make object public, confirm it can be accessed, then close drawer.
          cy.findByText('Access Control List (ACL)')
            .should('be.visible')
            .click()
            .type('Public Read');

          ui.autocompletePopper
            .findByTitle('Public Read')
            .should('be.visible')
            .click();

          ui.button.findByTitle('Save').should('be.visible').click();

          cy.findByText('Object access updated successfully.');
          assertStatusForUrlAtAlias('@bucketObjectUrl', 200);

          ui.drawerCloseButton.find().should('be.visible').click();
        });

      // Delete object, then delete folder that contained the object.
      ui.button.findByTitle('Delete').should('be.visible').click();

      ui.dialog
        .findByTitle(`Delete ${bucketFiles[1].name}`)
        .should('be.visible')
        .within(() => {
          ui.buttonGroup
            .findButtonByTitle('Delete')
            .should('be.visible')
            .click();
        });

      cy.findByText(emptyFolderMessage).should('be.visible');

      cy.visitWithLogin(bucketPage);
      ui.button.findByTitle('Delete').should('be.visible').click();

      ui.dialog
        .findByTitle(`Delete ${bucketFolderName}`)
        .should('be.visible')
        .within(() => {
          ui.button.findByTitle('Delete').should('be.visible').click();
        });

      // Confirm that bucket is empty.
      cy.findByText(emptyBucketMessage).should('be.visible');
    });
  });
});
