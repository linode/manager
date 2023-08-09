/**
 * @file Image update and deletion region tests.
 */

import type { Image, Region } from '@linode/api-v4';
import { uploadImage } from '@linode/api-v4';
import { authenticate } from 'support/api/authentication';
import { imageUploadProcessingTimeout } from 'support/constants/images';
import { ui } from 'support/ui';
import { SimpleBackoffMethod } from 'support/util/backoff';
import { pollImageStatus } from 'support/util/polling';
import { randomLabel, randomPhrase } from 'support/util/random';
import { describeRegions } from 'support/util/regions';

/**
 * Uploads a machine image and waits for it to become available.
 *
 * See Linode API v4 documentation for more information.
 *
 * @link https://www.linode.com/docs/api/images/#image-upload
 *
 * @param region - Image upload region.
 * @param data - Data to upload.
 *
 * @returns Promise that resolves to uploaded Image object.
 */
const uploadMachineImage = async (region: Region, data: Blob) => {
  const uploadResponse = await uploadImage({
    label: randomLabel(),
    region: region.id,
  });

  const [endpoint, image] = [uploadResponse.upload_to, uploadResponse.image];
  await fetch(endpoint, {
    method: 'PUT',
    body: data,
    headers: {
      'Content-type': 'application/octet-stream',
    },
  });

  await pollImageStatus(
    image.id,
    'available',
    new SimpleBackoffMethod(5000, {
      initialDelay: 20000,
      maxAttempts: 20,
    })
  );

  return image;
};

authenticate();
describeRegions('Delete Machine Images', (region: Region) => {
  /*
   * - Updates and deletes a Machine Image for the targeted region.
   * - Confirms that Image label and description can be updated.
   * - Confirms that landing page content changes to reflect updated Image.
   * - Confirms that Image can be deleted.
   * - Confirms that deleted Image is removed from the landing page.
   */
  it('can update and delete a Machine Image', () => {
    const newLabel = randomLabel();
    const newDescription = randomPhrase();

    // Upload a machine image using the `test-image.gz` fixture.
    // Wait for machine image to become ready, then begin test.
    cy.fixture('machine-images/test-image.gz', null).then(
      (imageFileContents) => {
        cy.defer(uploadMachineImage(region, imageFileContents), {
          label: 'uploading Machine Image',
          timeout: imageUploadProcessingTimeout,
        }).then((image: Image) => {
          // Navigate to Images landing page, find Image and click its Edit menu item.
          cy.visitWithLogin('/images');
          cy.findByText(image.label)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              cy.findByText('Ready').should('be.visible');
              ui.actionMenu
                .findByTitle(`Action menu for Image ${image.label}`)
                .should('be.visible')
                .click();
            });

          ui.actionMenuItem.findByTitle('Edit').should('be.visible').click();

          // Update Image label and description.
          ui.drawer
            .findByTitle('Edit Image')
            .should('be.visible')
            .within(() => {
              cy.findByLabelText('Label')
                .should('be.visible')
                .click()
                .clear()
                .type(newLabel);

              cy.findByLabelText('Description')
                .should('be.visible')
                .click()
                .clear()
                .type(newDescription);

              ui.button
                .findByTitle('Save Changes')
                .should('be.visible')
                .should('be.enabled')
                .click();
            });

          // Confirm that new label is shown on landing page, initiate delete.
          cy.findByText(newLabel)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              ui.actionMenu
                .findByTitle(`Action menu for Image ${newLabel}`)
                .should('be.visible')
                .click();
            });

          ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

          // Confirm Image delete prompt.
          ui.dialog
            .findByTitle(`Delete Image ${newLabel}`)
            .should('be.visible')
            .within(() => {
              ui.button
                .findByTitle('Delete Image')
                .should('be.visible')
                .should('be.enabled')
                .click();
            });

          // Confirm that Image is deleted successfully.
          ui.toast.assertMessage('Image has been scheduled for deletion.');
          ui.toast.assertMessage(`Image ${newLabel} deleted successfully.`);
          cy.findByText(image.label).should('not.exist');
          cy.findByText(newLabel).should('not.exist');
        });
      }
    );
  });
});
