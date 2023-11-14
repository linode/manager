import type { Region } from '@linode/api-v4';
import 'cypress-file-upload';
import { authenticate } from 'support/api/authentication';
import { imageUploadProcessingTimeout } from 'support/constants/images';
import { interceptUploadImage } from 'support/intercepts/images';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { randomLabel, randomPhrase } from 'support/util/random';
import { testRegions } from 'support/util/regions';

authenticate();
describe('Upload Machine Images', () => {
  before(() => {
    cleanUp('images');
  });
  /*
   * - Confirms that users can upload Machine Images to the targeted region.
   * - Confirms that user is redirected back to landing page.
   * - Confirms that uploaded Image is listed on the landing page.
   * - Confirms that Image uploads successfully and landing page reflects its status.
   */
  testRegions('can upload a Machine Image', (region: Region) => {
    const imageLabel = randomLabel();
    const imageDescription = randomPhrase();
    const imageFile = 'machine-images/test-image.gz';

    interceptUploadImage().as('uploadImage');
    // Navigate to Image upload page, enter label, select region, and upload Image file.
    cy.visitWithLogin('/images/create/upload');
    cy.findByText('Label').should('be.visible').click().type(imageLabel);

    cy.findByText('Description')
      .should('be.visible')
      .click()
      .type(imageDescription);

    ui.regionSelect.find().click();
    ui.regionSelect.findItemByRegionId(region.id).should('be.visible').click();

    // Pass `null` to `cy.fixture()` to encode file as a Cypress buffer object.
    cy.fixture(imageFile, null).then((imageFileContents) => {
      ui.fileUpload.find().attachFile({
        fileContent: imageFileContents,
        fileName: 'test-image',
        mimeType: 'application/x-gzip',
      });
    });

    // Wait for Image upload request and confirm toast notification is shown.
    cy.wait('@uploadImage');
    ui.toast.assertMessage(
      `Image ${imageLabel} uploaded successfully. It is being processed and will be available shortly.`
    );

    // Confirm redirect back to Images landing, new image is listed, and becomes available.
    cy.url().should('endWith', '/images');
    cy.findByText(imageLabel).should('be.visible');

    ui.toast.assertMessage(`Image ${imageLabel} is now available.`, {
      timeout: imageUploadProcessingTimeout,
    });

    cy.findByText(imageLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Ready').should('be.visible');
      });
  });
});
