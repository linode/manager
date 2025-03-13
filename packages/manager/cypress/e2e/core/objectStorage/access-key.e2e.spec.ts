/**
 * @file End-to-end tests for Object Storage Access Key operations.
 */

import { createBucket } from '@linode/api-v4/lib/object-storage';
import { authenticate } from 'support/api/authentication';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  interceptCreateAccessKey,
  interceptGetAccessKeys,
} from 'support/intercepts/object-storage';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { randomLabel } from 'support/util/random';

import { accountFactory } from 'src/factories';
import { createObjectStorageBucketFactoryLegacy } from 'src/factories/objectStorage';

authenticate();
describe('object storage access key end-to-end tests', () => {
  before(() => {
    cleanUp(['obj-buckets', 'obj-access-keys']);
  });
  beforeEach(() => {
    cy.tag('method:e2e');
  });

  /*
   * - Creates an access key with unlimited access
   * - Confirms that access key and secret key from API response are displayed.
   * - Confirms that secret key warning is displayed.
   * - Confirms that new access key is listed in landing page table.
   * - Confirms that access key has expected permissions.
   */
  it('can create an access key with unlimited access - e2e', () => {
    const keyLabel = randomLabel();

    interceptGetAccessKeys().as('getKeys');
    interceptCreateAccessKey().as('createKey');

    mockGetAccount(accountFactory.build({ capabilities: ['Object Storage'] }));
    mockAppendFeatureFlags({
      objMultiCluster: false,
      objectStorageGen2: { enabled: false },
    });

    cy.visitWithLogin('/object-storage/access-keys');
    cy.wait('@getKeys');

    // Click "Create Access Key" button in entity header.
    ui.entityHeader.find().within(() => {
      cy.findByText('Create Access Key').should('be.visible').click();
    });

    // Enter access key label in drawer, then click "Create Access Key".
    ui.drawer
      .findByTitle('Create Access Key')
      .should('be.visible')
      .within(() => {
        cy.findByText('Label').click();
        cy.focused().type(keyLabel);
        ui.buttonGroup
          .findButtonByTitle('Create Access Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@createKey').then((intercepts) => {
      // Use non-exact match; this allows leniency for wording to change but
      // ensures that the user is warned that secret key only displays once.
      const secretKeyWarning = 'we can only display your secret key once';
      const accessKey = intercepts.response?.body?.access_key;
      const secretKey = intercepts.response?.body?.secret_key;

      ui.dialog
        .findByTitle('Access Keys')
        .should('be.visible')
        .within(() => {
          cy.findByText(secretKeyWarning, { exact: false }).should(
            'be.visible'
          );

          cy.get('input[id="access-key"]')
            .should('be.visible')
            .should('have.value', accessKey);
          cy.get('input[id="secret-key"]')
            .should('be.visible')
            .should('have.value', secretKey);

          ui.buttonGroup
            .findButtonByTitle('I Have Saved My Secret Key')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.findByLabelText('List of Object Storage Access Keys').within(() => {
        cy.findByText(keyLabel)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText(accessKey).should('be.visible');
            cy.findByText('Permissions').click();
          });
      });

      const unlimitedPermissionsNotice =
        'This key has unlimited access to all buckets on your account.';
      cy.findByText(unlimitedPermissionsNotice).should('be.visible');
    });
  });

  /**
   * - Creates an access key with only read access to a bucket.
   * - Confirms that access key and secret key from API response are displayed.
   * - Confirms that new access key is listed in landing page title.
   * - Confirms that access key has expected permissions.
   */
  it('can create an access key with limited access - e2e', () => {
    const bucketLabel = randomLabel();
    const bucketCluster = 'us-east-1';
    const bucketRequest = createObjectStorageBucketFactoryLegacy.build({
      cluster: bucketCluster,
      label: bucketLabel,
      // Default factory sets `cluster` and `region`, but API does not accept `region` yet.
      region: undefined,
    });

    // Create a bucket before creating access key.
    cy.defer(
      () => createBucket(bucketRequest),
      'creating Object Storage bucket'
    ).then(() => {
      const keyLabel = randomLabel();

      mockGetAccount(
        accountFactory.build({ capabilities: ['Object Storage'] })
      );
      mockAppendFeatureFlags({
        objMultiCluster: false,
        objectStorageGen2: { enabled: false },
      });

      interceptGetAccessKeys().as('getKeys');
      interceptCreateAccessKey().as('createKey');

      cy.visitWithLogin('/object-storage/access-keys');
      cy.wait('@getKeys');

      // Click "Create Access Key" button in entity header.
      ui.entityHeader.find().within(() => {
        cy.findByText('Create Access Key').should('be.visible').click();
      });

      // Enter access key label in drawer, set read-only access, then click "Create Access Key".
      ui.drawer
        .findByTitle('Create Access Key')
        .should('be.visible')
        .within(() => {
          cy.findByText('Label').click();
          cy.focused().type(keyLabel);
          cy.findByLabelText('Limited Access').click();
          cy.findByLabelText('Select read-only for all').click();

          ui.buttonGroup
            .findButtonByTitle('Create Access Key')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      /*
       * Wait for access key to be created, confirm that dialog is shown, close
       * dialog. Then confirm that key is listed in table and displays the correct
       * permissions.
       */
      cy.wait('@createKey').then((intercepts) => {
        const accessKey = intercepts.response?.body?.access_key;
        const secretKey = intercepts.response?.body?.secret_key;

        ui.dialog
          .findByTitle('Access Keys')
          .should('be.visible')
          .within(() => {
            cy.get('input[id="access-key"]')
              .should('be.visible')
              .should('have.value', accessKey);
            cy.get('input[id="secret-key"]')
              .should('be.visible')
              .should('have.value', secretKey);

            ui.buttonGroup
              .findButtonByTitle('I Have Saved My Secret Key')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        cy.findByLabelText('List of Object Storage Access Keys').within(() => {
          cy.findByText(keyLabel)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              cy.findByText(accessKey).should('be.visible');
              cy.findByText('Permissions').click();
            });
        });

        const permissionLabel = `This token has read-only access for ${bucketCluster}-${bucketLabel}`;
        cy.findByLabelText(permissionLabel).should('be.visible');
      });
    });
  });
});
