import 'cypress-file-upload';
import { describeRegions } from 'support/util/regions';
import { ui } from 'support/ui';
import { randomLabel, randomPhrase } from 'support/util/random';
import { interceptUploadImage } from 'support/intercepts/images';
import type { Region } from '@linode/api-v4';

// Length of time to wait for Image to finish processing, milliseconds.
// 5 minutes.
const imageProcessingTimeout = 300000;

describeRegions('Upload Machine Images', (region: Region) => {
  it('can upload a machine image', () => {
    const imageLabel = randomLabel();
    const imageDescription = randomPhrase();
    const imageFile = 'machine-images/test-image.gz';

    interceptUploadImage().as('uploadImage');
    cy.visitWithLogin('/images/create/upload');
    cy.findByText('Label').should('be.visible').click().type(imageLabel);

    cy.findByText('Description')
      .should('be.visible')
      .click()
      .type(imageDescription);

    cy.contains('Select a Region').should('be.visible').click();

    ui.regionSelect.findItemByRegionId(region.id).should('be.visible').click();

    // Pass `null` to `cy.fixture()` to encode file as a Cypress buffer object.
    cy.fixture(imageFile, null).then((imageFileContents) => {
      ui.fileUpload.find().attachFile({
        fileContent: imageFileContents,
        fileName: 'test-image',
        mimeType: 'application/x-gzip',
      });
    });

    cy.wait('@uploadImage');
    ui.toast.assertMessage(
      `Image ${imageLabel} uploaded successfully. It is being processed and will be available shortly.`
    );

    // Confirm redirect back to Images landing, new image is listed, and becomes available.
    cy.url().should('endWith', '/images');
    cy.findByText(imageLabel).should('be.visible');

    ui.toast.assertMessage(`Image ${imageLabel} is now available.`, {
      timeout: imageProcessingTimeout,
    });

    cy.findByText(imageLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Ready').should('be.visible');
      });
  });
});
