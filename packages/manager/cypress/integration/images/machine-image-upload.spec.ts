/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sonarjs/no-identical-functions */
import { createMockImage, deleteAllTestImages } from '../../support/api/images';
import { fbtClick, fbtVisible, getClick } from '../../support/helpers';
import 'cypress-file-upload';
import { assertToast } from 'cypress/support/ui/events';
import { DateTime } from 'luxon';
import { eventFactory } from '@src/factories';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { interceptOnce } from 'cypress/support/ui/common';
import { RecPartial } from 'factory.ts';
import { EventStatus } from '../../../../api-v4/lib/account/types';
import { ImageStatus } from '../../../../api-v4/lib/images/types';

const imageLabel = 'cy-test-image';

const eventIntercept = (
  id: number,
  status: RecPartial<EventStatus>,
  message?: string,
  created?: string
) => {
  interceptOnce(
    'GET',
    '*/account/events*',
    makeResourcePage(
      eventFactory.buildList(1, {
        created: created ? created : DateTime.local().toISO(),
        action: 'image_upload',
        entity: {
          label: imageLabel,
          id,
          type: 'image',
          url: `/v4/images/private/${id}`,
        },
        status,
        secondary_entity: null,
        message: message ? message : '',
      })
    )
  ).as('getEvent');
};

const imageIntercept = (id: number, status: ImageStatus) => {
  cy.intercept('GET', `*/images*`, (req) => {
    req.reply(createMockImage({ label: imageLabel, id, status }));
  }).as('getImage');
};

const assertFailed = (imageId: number, message: string) => {
  assertToast(
    `There was a problem processing image ${imageLabel}: ${message}`,
    2
  );
  cy.get(`[data-qa-image-cell="${imageId}"]`).within(() => {
    fbtVisible(imageLabel);
    fbtVisible('Failed');
    fbtVisible('N/A');
  });
};

const assertProcessing = (imageId: number) => {
  cy.get(`[data-qa-image-cell="${imageId}"]`).within(() => {
    fbtVisible(imageLabel);
    fbtVisible('Processing');
    fbtVisible('Pending');
  });
};

const uploadImage = () => {
  const regionSelect = 'Fremont, CA';
  const upload = 'testImage.gz';
  cy.visitWithLogin('/images/create/upload');
  getClick('[id="label"][data-testid="textfield-input"]').type(imageLabel);
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
  cy.intercept('POST', '*/images/upload').as('imageUpload');
};

describe('machine image', () => {
  beforeEach(() => {
    deleteAllTestImages();
  });

  it('uploads machine image, mock finished event', () => {
    const status = 'finished';
    uploadImage();
    cy.wait('@imageUpload').then((xhr) => {
      const imageId = xhr.response?.body.image.id;
      imageIntercept(imageId, 'available');
      eventIntercept(imageId, status);
      assertToast(
        `Image ${imageLabel} uploaded successfully. It is being processed and will be available shortly.`
      );
      cy.wait('@getImage');
      cy.wait('@getEvent');
      assertToast(`Image ${imageLabel} is now available.`, 2);
      cy.get(`[data-qa-image-cell="${imageId}"]`).within(() => {
        fbtVisible(imageLabel);
        fbtVisible('Ready');
      });
    });
  });

  it('uploads machine image, mock upload canceled failed event', () => {
    const status = 'failed';
    const message = 'Upload canceled';
    uploadImage();
    cy.wait('@imageUpload').then((xhr) => {
      const imageId = xhr.response?.body.image.id;
      assertProcessing(imageId);
      eventIntercept(imageId, status, message);
      cy.wait('@getEvent');
      assertFailed(imageId, message);
    });
  });

  it('uploads machine image, mock failed to decompress failed event', () => {
    const status = 'failed';
    const message = 'Failed to decompress image';
    uploadImage();
    cy.wait('@imageUpload').then((xhr) => {
      const imageId = xhr.response?.body.image.id;
      assertProcessing(imageId);
      eventIntercept(imageId, status, message);
      cy.wait('@getEvent');
      assertFailed(imageId, message);
    });
  });

  it('uploads machine image, mock expired upload event', () => {
    const status = 'failed';
    const message = 'Upload window expired';
    const expiredDate = DateTime.local().minus({ days: 1 }).toISO();
    uploadImage();
    cy.wait('@imageUpload').then((xhr) => {
      const imageId = xhr.response?.body.image.id;
      assertProcessing(imageId);
      eventIntercept(imageId, status, message, expiredDate);
      cy.wait('@getEvent');
      assertFailed(imageId, message);
    });
  });
});
