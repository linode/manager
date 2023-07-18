/**
 * @file Image update and deletion region tests.
 */

import type { Region, Image } from '@linode/api-v4';
import { describeRegions } from 'support/util/regions';
import { uploadImage } from '@linode/api-v4';
import { randomLabel, randomPhrase } from 'support/util/random';
import { authenticate } from 'support/api/authentication';
import { pollImageStatus } from 'support/util/polling';
import { SimpleBackoffMethod } from 'support/util/backoff';
import { imageUploadProcessingTimeout } from 'support/constants/images';
import { ui } from 'support/ui';

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
  it('can update and delete a machine image', () => {
    const newLabel = randomLabel();
    const newDescription = randomPhrase();

    cy.fixture('machine-images/test-image.gz', null).then(
      (imageFileContents) => {
        cy.defer(uploadMachineImage(region, imageFileContents), {
          label: 'uploading Machine Image',
          timeout: imageUploadProcessingTimeout,
        }).then((image: Image) => {
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

          ui.toast.assertMessage('Image has been scheduled for deletion.');
          ui.toast.assertMessage(`Image ${newLabel} deleted successfully.`);
          cy.findByText(image.label).should('not.exist');
          cy.findByText(newLabel).should('not.exist');
        });
      }
    );
  });
});
