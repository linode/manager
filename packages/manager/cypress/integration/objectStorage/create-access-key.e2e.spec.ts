import { objectStorageBucketFactory } from 'src/factories/objectStorage';
import { authenticate } from 'support/api/authentication';
import { createBucket, ObjectStorageBucket } from '@linode/api-v4/lib/object-storage'
import { interceptGetAccessKeys, interceptCreateAccessKey } from 'support/intercepts/object-storage';
import { randomLabel, randomItem } from 'support/util/random';

authenticate();
describe('object storage access key create flow', () => {

  /*
   * - Creates an access key with unlimited access
   * - Confirms that access key and secret key from API response are displayed.
   * - Confirms that secret key warning is displayed.
   * - Confirms that new access key is listed in landing page table.
   * - Confirms that access key has expected permissions.
   */
  it('can create an access key with unlimited access', () => {
    const keyLabel = randomLabel();

    interceptGetAccessKeys().as('getKeys');
    interceptCreateAccessKey().as('createKey');

    cy.visitWithLogin('/object-storage/access-keys');
    cy.wait('@getKeys');

    // Click "Create Access Key" button in entity header.
    cy.get('[data-qa-entity-header="true"]').within(() => {
      cy.findByText('Create Access Key')
        .should('be.visible')
        .click();
    });

    // Enter access key label in drawer, then click "Create Access Key".
    cy.get('[data-qa-drawer="true"]').within(() => {
      cy.findByText('Create Access Key').should('be.visible');
      cy.findByText('Label').click().type(keyLabel);

      cy.get('[data-qa-buttons="true"]').within(() => {
        cy.findByText('Create Access Key').click();
      });
    });

    // Wait for access key to be created, confirm that dialog is shown, close dialog.
    cy.wait('@createKey').then((intercepts) => {
      // Use non-exact match; this allows leniency for wording to change but
      // ensures that the user is warned that secret key only displays once.
      const secretKeyWarning = 'we can only display your secret key once';
      const accessKey = intercepts.response?.body?.access_key;
      const secretKey = intercepts.response?.body?.secret_key;

      cy.findByText(secretKeyWarning, { exact: false }).should('be.visible');
      cy.get('[id="access-key"]').should('be.visible').should('have.value', accessKey);
      cy.get('[id="secret-key"]').should('be.visible').should('have.value', secretKey);
      cy.findByLabelText('Close drawer').should('be.visible').click();

      cy.findByLabelText('List of Object Storage Access Keys').within(() => {
        cy.findByText(keyLabel).should('be.visible').closest('tr').within(() => {
          cy.findByText(accessKey).should('be.visible');
          cy.findByText('Permissions').click();
        });
      });

      const unlimitedPermissionsNotice = 'This key has unlimited access to all buckets on your account.';
      cy.findByText(unlimitedPermissionsNotice).should('be.visible');
    });
  });

  it('can create an access key with limited access', () => {
    const bucketLabel = randomLabel();
    const bucketRequest = objectStorageBucketFactory.build({
      label: bucketLabel,
      cluster: 'us-east-1',
    });

    // Create a bucket before creating access key.
    cy.defer(createBucket(bucketRequest)).then((bucket: ObjectStorageBucket) => {

      interceptGetAccessKeys().as('getKeys');
      interceptCreateAccessKey().as('createKey');

      cy.visitWithLogin('/object-storage/access-keys');
      cy.wait('@getKeys');
    });
  });
});
