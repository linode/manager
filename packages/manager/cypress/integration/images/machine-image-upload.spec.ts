import { createMockImage } from '../../support/api/images';
import { fbtClick, fbtVisible, getClick } from '../../support/helpers';
import 'cypress-file-upload';
import { assertToast } from 'cypress/support/ui/events';
import { DateTime } from 'luxon';
import { eventFactory } from '@src/factories';
import { makeResourcePage } from '@src/mocks/serverHandlers';

const mockImage = createMockImage().data[0];
const imageLabel = mockImage.label;
const imageId = mockImage.id;
const regionSelect = 'Fremont, CA';
const upload = 'testImage.gz';
const createdDate = DateTime.local().minus({ days: 1 }).toISO();

const uploadImage = () => {
  cy.visitWithLogin('/images/create/upload');
  getClick('[id="label-(required)"]').type(imageLabel);
  getClick('[id="description"]').type('This is a machine image upload test');
  fbtClick('Select a Region');
  fbtClick(regionSelect);
  cy.fixture(upload).then((fileContent) => {
    cy.get('input[accept="application/x-gzip"]').attachFile({
      fileContent,
      fileName: 'testImage',
      mimeType: 'application/x-gzip',
    });
  });
};

const interceptOnce = (method, url, response) => {
  let count = 0;
  return cy.intercept(method, url, (req) => {
    count += 1;
    if (count < 3) {
      req.reply(response);
    }
  });
};

describe('machine image', () => {
  it('uploads machine image', () => {
    cy.intercept('POST', '*/images/upload').as('imageUpload');
    uploadImage();
    cy.wait('@imageUpload');
    fbtVisible('testImage');
    fbtVisible(imageLabel);
  });

  it('uploads machine image, mock failed event', () => {
    const failureMessage = 'Forced Fail Via Mock';
    cy.intercept('POST', '*/images/upload').as('imageUpload');
    uploadImage();
    cy.wait('@imageUpload').then((xhr) => {
      const actualId = xhr.response?.body.image.id;
      cy.get(`[data-qa-image-cell="${actualId}"]`).within(() => {
        fbtVisible(imageLabel);
        fbtVisible('Pending');
      });

      interceptOnce(
        'GET',
        '*/account/events*',
        makeResourcePage(
          eventFactory.buildList(1, {
            action: 'image_upload',
            entity: {
              label: imageLabel,
              id: actualId,
              type: 'image',
              url: `/v4/images/${actualId}`,
            },
            status: 'failed',
            secondary_entity: null,
            message: failureMessage,
          })
        )
      ).as('getEvent');
      cy.wait('@getEvent');
      assertToast(
        `Image ${imageLabel} uploaded successfully. It is being processed and will be available shortly.`
      );
      assertToast(
        `There was a problem processing image ${imageLabel}: ${failureMessage}`,
        2
      );
      cy.get(`[data-qa-image-cell="${actualId}"]`).within(() => {
        fbtVisible(imageLabel);
        fbtVisible('Failed');
        fbtVisible('N/A');
      });
    });
  });

  it.only('uploads machine image, mock finished event', () => {
    const finishedMessage = 'finished message';
    cy.intercept('POST', '*/images/upload').as('imageUpload');
    uploadImage();
    cy.wait('@imageUpload').then((xhr) => {
      const actualId = xhr.response?.body.image.id;
      assertToast(
        `Image ${imageLabel} uploaded successfully. It is being processed and will be available shortly.`
      );
      cy.get(`[data-qa-image-cell="${actualId}"]`).within(() => {
        fbtVisible(imageLabel);
        fbtVisible('Pending');
      });

      interceptOnce(
        'GET',
        '*/account/events*',
        makeResourcePage(
          eventFactory.buildList(1, {
            action: 'image_upload',
            entity: {
              label: imageLabel,
              id: actualId,
              type: 'image',
              url: `/v4/images/${actualId}`,
            },
            status: 'finished',
            secondary_entity: null,
            message: finishedMessage,
          })
        )
      ).as('getEvent');
      cy.wait('@getEvent');
      assertToast(`Image ${imageLabel} is now available.`, 2);
      cy.get(`[data-qa-image-cell="${actualId}"]`).within(() => {
        fbtVisible(imageLabel);
        fbtVisible('Ready');
        // fbtVisible('N/A');
      });
    });
  });

  it('uploads machine image, mock expired upload event', () => {
    const createdDate = DateTime.local().minus({ days: 1 }).toISO();
    const finishedMessage = 'finished message';
    cy.intercept('POST', '*/images/upload').as('imageUpload');
    uploadImage();
    cy.wait('@imageUpload').then((xhr) => {
      const actualId = xhr.response?.body.image.id;
      cy.get(`[data-qa-image-cell="${actualId}"]`).within(() => {
        fbtVisible(imageLabel);
        fbtVisible('Pending');
      });

      interceptOnce(
        'GET',
        '*/account/events*',
        makeResourcePage(
          eventFactory.buildList(1, {
            created: createdDate,
            action: 'image_upload',
            username: 'some-test-account',
            entity: {
              label: imageLabel,
              id: actualId,
              type: 'image',
              url: `/v4/images/${actualId}`,
            },
            status: 'failed',
            secondary_entity: null,
            message: finishedMessage,
          })
        )
      ).as('getEvent');
      cy.wait('@getEvent');
      assertToast(
        `Image ${imageLabel} uploaded successfully. It is being processed and will be available shortly.`
      );
      assertToast(`Image cy-test-image is now availabe`);
      cy.get(`[data-qa-image-cell="${actualId}"]`).within(() => {
        fbtVisible(imageLabel);
        fbtVisible('Failed');
        fbtVisible('N/A');
      });
    });
  });
});
