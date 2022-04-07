/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sonarjs/no-identical-functions */
import { fbtClick, fbtVisible, getClick } from '../../support/helpers';
import 'cypress-file-upload';
import { assertToast } from 'cypress/support/ui/events';
import { DateTime } from 'luxon';
import { eventFactory, imageFactory } from '@src/factories';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { interceptOnce } from 'cypress/support/ui/common';
import { RecPartial } from 'factory.ts';
import { EventStatus } from '../../../../api-v4/lib/account/types';
import { ImageStatus } from '../../../../api-v4/lib/images/types';
import { randomLabel, randomItem } from 'support/util/random';

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

const assertFailed = (label: string, imageId: number, message: string) => {
  assertToast(`There was a problem processing image ${label}: ${message}`, 2);
  cy.get(`[data-qa-image-cell="${imageId}"]`).within(() => {
    fbtVisible(label);
    fbtVisible('Failed');
    fbtVisible('N/A');
  });
};

const assertProcessing = (label: string, imageId: number) => {
  cy.get(`[data-qa-image-cell="${imageId}"]`).within(() => {
    fbtVisible(label);
    fbtVisible('Processing');
    fbtVisible('Pending');
  });
};

const uploadImage = (label: string) => {
  const regionSelect = randomItem(regionsFriendly);
  const upload = 'testImage.gz';
  cy.visitWithLogin('/images/create/upload');
  getClick('[id="label"][data-testid="textfield-input"]').type(label);
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
  it('uploads machine image, mock finished event', () => {
    const label = randomLabel();
    const status = 'finished';
    uploadImage(label);
    cy.wait('@imageUpload').then((xhr) => {
      const imageId = xhr.response?.body.image.id;
      imageIntercept(label, imageId, 'available');
      eventIntercept(label, imageId, status);
      assertToast(
        `Image ${label} uploaded successfully. It is being processed and will be available shortly.`
      );
      cy.wait('@getImage');
      cy.wait('@getEvent');
      assertToast(`Image ${label} is now available.`, 2);
      cy.get(`[data-qa-image-cell="${imageId}"]`).within(() => {
        fbtVisible(label);
        fbtVisible('Ready');
      });
    });
  });

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
