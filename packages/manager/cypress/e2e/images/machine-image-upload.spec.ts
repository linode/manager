import { EventStatus, ImageStatus } from '@linode/api-v4/types';
import { eventFactory, imageFactory } from '@src/factories';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import 'cypress-file-upload';
import { RecPartial } from 'factory.ts';
import { DateTime } from 'luxon';
import { regionsFriendly } from 'support/constants/regions';
import { fbtClick, fbtVisible, getClick } from 'support/helpers';
import { ui } from 'support/ui';
import { interceptOnce } from 'support/ui/common';
import { randomItem, randomLabel, randomPhrase } from 'support/util/random';

/*
 * Amount of time to wait for toast notification after uploading image, in ms.
 *
 * We extend the timeout used when waiting for image uploading and processing
 * since this operation can take a couple minutes.
 */
const imageUploadWaitTimeout = 120000;

/**
 * Returns a numeric image ID from a string-based image ID.
 *
 * @param imageIdString - Image ID string to convert to number.
 *
 * @example
 * numericImageIdFromString('private/1111111'); // Returns 1111111.
 *
 * @returns Numeric image ID.
 */
const numericImageIdFromString = (imageIdString: string): number => {
  const substring = imageIdString.split('/')[1];
  return parseInt(substring, 10);
};

/**
 * Intercepts the response from the next events poll request.
 *
 * Responds with an `image_upload` event associated with an image.
 *
 * @param label - Label of image that is associated with the event.
 * @param id - ID of image that is associated with the event. Expected to be prefixed with a string (e.g. 'private/12345').
 * @param status - Event status.
 * @param message - Optional event message.
 * @param created - Optional event created data. If omitted, the current time is used.
 */
const eventIntercept = (
  label: string,
  id: string,
  status: RecPartial<EventStatus>,
  message?: string,
  created?: string
) => {
  const numericId = numericImageIdFromString(id);
  interceptOnce(
    'GET',
    '*/account/events*',
    makeResourcePage(
      eventFactory.buildList(1, {
        created: created ? created : DateTime.local().toISO(),
        action: 'image_upload',
        entity: {
          label: label,
          id: numericId,
          type: 'image',
          url: `/v4/images/private/${numericId}`,
        },
        status,
        secondary_entity: null,
        message: message ? message : '',
      })
    )
  ).as('getEvent');
};

/**
 * Intercepts the response for an image GET request.
 *
 * Responds with an image with the given label, ID, and status.
 *
 * @param label - Response image label.
 * @param id - Response image ID. Expected to be prefixed with a string (e.g. 'private/12345').
 * @param status - Image status.
 */
const imageIntercept = (label: string, id: string, status: ImageStatus) => {
  cy.intercept('GET', `*/images/${id}*`, (req) => {
    req.reply(
      imageFactory.build({
        label,
        id,
        status,
      })
    );
  }).as('getImage');
};

/**
 * Asserts that provisioning an image fails.
 *
 * @param label - Label for image that is expected to fail.
 * @param id - ID for image that is expected to fail. Expected to be prefixed with a string (e.g. 'private/12345').
 * @param message - Expected failure message.
 */
const assertFailed = (label: string, id: string, message: string) => {
  ui.toast.assertMessage(
    `There was a problem processing image ${label}: ${message}`
  );

  cy.get(`[data-qa-image-cell="${id}"]`).within(() => {
    fbtVisible(label);
    fbtVisible('Failed');
    fbtVisible('N/A');
  });
};

/**
 * Asserts that an image is in the process of being provisioned.
 *
 * @param label - Label for image that is expected to be processing.
 * @param id - ID for image that is expected to be processing. Expected to be prefixed with a string (e.g. 'private/12345').
 */
const assertProcessing = (label: string, id: string) => {
  cy.get(`[data-qa-image-cell="${id}"]`).within(() => {
    fbtVisible(label);
    fbtVisible('Processing');
    fbtVisible('Pending');
  });
};

/**
 * Uploads an image and intercepts the request response.
 *
 * The image is uploaded to a random region.
 *
 * @param label - Label to apply to uploaded image.
 */
const uploadImage = (label: string) => {
  const regionSelect = randomItem(regionsFriendly);
  const upload = 'testImage.gz';
  cy.visitWithLogin('/images/create/upload');
  getClick('[id="label"][data-testid="textfield-input"]').type(label);
  getClick('[id="description"]').type('This is a machine image upload test');
  fbtClick('Select a Region');
  fbtClick(regionSelect);
  // Pass `null` to `cy.fixture()` to ensure file is encoded as a Cypress buffer object.
  cy.fixture(upload, null).then((fileContent) => {
    cy.get('input[type="file"]').attachFile({
      fileContent,
      fileName: 'testImage',
      mimeType: 'application/x-gzip',
    });
  });
  cy.intercept('POST', '*/images/upload').as('imageUpload');
};

describe('machine image', () => {
  /*
   * - Uploads machine image.
   * - Confirms that image uploads successfully.
   * - Confirms that machine image is listed in landing page as expected.
   * - Confirms that notifications appear that describe the image's success status.
   * - Confirms that image label can be updated.
   * - Confirms that image description can be updated.
   * - Confirms that image can be deleted.
   */
  it('uploads, updates, and deletes a machine image, end-to-end', () => {
    const initialLabel = randomLabel();
    const updatedLabel = randomLabel();
    const updatedDescription = randomPhrase();

    uploadImage(initialLabel);
    cy.wait('@imageUpload').then((xhr) => {
      const imageId = xhr.response?.body.image.id;

      ui.toast.assertMessage(`Image ${initialLabel} is now available.`, {
        timeout: imageUploadWaitTimeout,
      });

      cy.get(`[data-qa-image-cell="${imageId}"]`).within(() => {
        cy.findByText(initialLabel).should('be.visible');
        cy.findByText('Ready').should('be.visible');

        ui.actionMenu
          .findByTitle(`Action menu for Image ${initialLabel}`)
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
            .clear()
            .type(updatedLabel);

          cy.findByLabelText('Description')
            .should('be.visible')
            .clear()
            .type(updatedDescription);

          ui.buttonGroup
            .findButtonByTitle('Save Changes')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.get(`[data-qa-image-cell="${imageId}"]`).within(() => {
        cy.findByText(updatedLabel).should('be.visible');
        cy.findByText(initialLabel).should('not.exist');
        ui.actionMenu
          .findByTitle(`Action menu for Image ${updatedLabel}`)
          .should('be.visible')
          .click();
      });

      ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

      ui.dialog
        .findByTitle(`Delete Image ${updatedLabel}`)
        .should('be.visible')
        .within(() => {
          ui.buttonGroup
            .findButtonByTitle('Delete Image')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      ui.toast.assertMessage('Image has been scheduled for deletion.');
      cy.findByText(updatedLabel).should('not.exist');
    });
  });

  /*
   * - Uploads machine image.
   * - Mocks events and image requests to simulate successful upload.
   * - Confirms that machine image is listed in landing page as expected.
   * - Confirms that notifications appear that describe the image's success status.
   */
  it('uploads machine image, mock finish event', () => {
    const label = randomLabel();
    const status = 'finished';

    const uploadMessage = `Image ${label} uploaded successfully. It is being processed and will be available shortly.`;
    const availableMessage = `Image ${label} is now available.`;

    uploadImage(label);
    cy.wait('@imageUpload').then((xhr) => {
      const imageId = xhr.response?.body.image.id;
      assertProcessing(label, imageId);
      imageIntercept(label, imageId, 'available');
      eventIntercept(label, imageId, status);
      ui.toast.assertMessage(uploadMessage);
      cy.wait('@getImage');
      ui.toast.assertMessage(availableMessage);
      cy.get(`[data-qa-image-cell="${imageId}"]`).within(() => {
        fbtVisible(label);
        fbtVisible('Ready');
      });
    });
  });

  /*
   * - Uploads machine image.
   * - Mocks events to simulate cancelled upload.
   * - Confirms that machine image is listed in landing page as expected.
   * - Confirms that notifications appear that describe the image's failed status.
   */
  it('uploads machine image, mock upload canceled failed event', () => {
    const label = randomLabel();
    const status = 'failed';
    const message = 'Upload canceled';
    uploadImage(label);
    cy.wait('@imageUpload').then((xhr) => {
      const imageId = xhr.response?.body.image.id;
      assertProcessing(label, imageId);
      eventIntercept(label, imageId, status, message);
      cy.wait('@getEvent');
      assertFailed(label, imageId, message);
    });
  });

  /*
   * - Uploads machine image.
   * - Mocks events to simulate decompression failure.
   * - Confirms that machine image is listed in landing page as expected.
   * - Confirms that notifications appear that describe the image's failed status.
   */
  it('uploads machine image, mock failed to decompress failed event', () => {
    const label = randomLabel();
    const status = 'failed';
    const message = 'Failed to decompress image';
    uploadImage(label);
    cy.wait('@imageUpload').then((xhr) => {
      const imageId = xhr.response?.body.image.id;
      assertProcessing(label, imageId);
      eventIntercept(label, imageId, status, message);
      cy.wait('@getEvent');
      assertFailed(label, imageId, message);
    });
  });

  /*
   * - Uploads machine image.
   * - Mocks events to simulate upload expiration failure.
   * - Confirms that machine image is listed in landing page as expected.
   * - Confirms that notifications appear that describe the image's failed status.
   */
  it('uploads machine image, mock expired upload event', () => {
    const label = randomLabel();
    const status = 'failed';
    const message = 'Upload window expired';
    const expiredDate = DateTime.local().minus({ days: 1 }).toISO();
    uploadImage(label);
    cy.wait('@imageUpload').then((xhr) => {
      const imageId = xhr.response?.body.image.id;
      assertProcessing(label, imageId);
      eventIntercept(label, imageId, status, message, expiredDate);
      cy.wait('@getEvent');
      assertFailed(label, imageId, message);
    });
  });
});
