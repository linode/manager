import { createMockImage, deleteAllTestImages } from '../../support/api/images';
import { fbtClick, fbtVisible, getClick } from '../../support/helpers';
import 'cypress-file-upload';
import { assertToast } from 'cypress/support/ui/events';
import { DateTime } from 'luxon';
import { eventFactory, imageFactory } from '@src/factories';
import { makeResourcePage } from '@src/mocks/serverHandlers';

const imageLabel = 'cy-test-image';

const interceptOnce = (method, url, response) => {
  let count = 0;
  return cy.intercept(method, url, (req) => {
    count += 1;
    if (count < 3) {
      req.reply(response);
    }
  });
};

const getIntercepts = (id, status, message?, created?) => {
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
        message: message ? message : '',
      })
    )
  ).as('getEvent');
  cy.intercept('GET', `*/images*`, (req) => {
    req.reply(createMockImage({ label: imageLabel, id }));
  }).as('getImage');
};

const uploadImage = (status?) => {
  const regionSelect = 'Fremont, CA';
  const upload = 'testImage.gz';
  const image = createMockImage(
    status ? { status, label: imageLabel } : { label: imageLabel }
  ).data[0];

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
  cy.intercept('POST', '*/images/upload', (req) => {
    req.continue(() => {
      {
        image;
      }
    });
  }).as('imageUpload');
};

describe('machine image', () => {
  beforeEach(() => {
    deleteAllTestImages();
  });

  it('uploads machine image', () => {
    uploadImage();
    cy.wait('@imageUpload');
    fbtVisible('testImage');
    fbtVisible(imageLabel);
  });

  it.only('uploads machine image, mock finished event', () => {
    const status = 'finished';

    uploadImage('pending_upload');
    cy.wait('@imageUpload').then((xhr) => {
      const imageId = xhr.response?.body.image.id;
      getIntercepts(imageId, status);
      cy.wait('@getEvent');
      cy.wait('@getImage');
      assertToast(
        `Image ${imageLabel} uploaded successfully. It is being processed and will be available shortly.`
      );
      assertToast(`Image ${imageLabel} is now available.`, 2);
      cy.get(`[data-qa-image-cell="${imageId}"]`).within(() => {
        fbtVisible(imageLabel);
        fbtVisible('Ready');
      });
    });
  });

  it('uploads machine image, mock upload cancelled failed event', () => {
    const status = 'failed';
    const message = 'Upload cancelled.';

    uploadImage('pending_upload');
    cy.wait('@imageUpload').then((xhr) => {
      const imageId = xhr.response?.body.image.id;
      getIntercepts(imageId, status, message);
      cy.wait('@getEvent');
      cy.wait('@getImage');
      assertToast(
        `Image ${imageLabel} uploaded successfully. It is being processed and will be available shortly.`
      );
      assertToast(
        `There was a problem processing image ${imageLabel}: ${message}`,
        2
      );
      cy.url().should(
        'eq',
        `${Cypress.env('REACT_APP_APP_ROOT')}/images/create/upload`
      );
    });
  });

  it('uploads machine image, mock failed to decompress failed event', () => {
    const status = 'failed';
    const message = 'Failed to decompress image';

    uploadImage('pending_upload');
    cy.wait('@imageUpload').then((xhr) => {
      const imageId = xhr.response?.body.image.id;
      getIntercepts(imageId, status, message);
      cy.wait('@getEvent');
      cy.wait('@getImage');
      assertToast(
        `Image ${imageLabel} uploaded successfully. It is being processed and will be available shortly.`
      );
      assertToast(
        `There was a problem processing image ${imageLabel}: ${message}`,
        2
      );
      cy.get(`[data-qa-image-cell="${imageId}"]`).within(() => {
        fbtVisible(imageLabel);
        fbtVisible('Failed');
        fbtVisible('N/A');
      });
    });
  });

  it('uploads machine image, mock expired upload event', () => {
    const status = 'failed';
    const message = 'Upload window expired';
    const expiredDate = DateTime.local().minus({ days: 1 }).toISO();

    uploadImage('pending_upload');
    cy.wait('@imageUpload').then((xhr) => {
      const imageId = xhr.response?.body.image.id;
      getIntercepts(imageId, status, message, expiredDate);
      cy.wait('@getEvent');
      cy.wait('@getImage');
      assertToast(
        `Image ${imageLabel} uploaded successfully. It is being processed and will be available shortly.`
      );
      assertToast(`Image ${imageLabel} is now available.`, 2);
      cy.get(`[data-qa-image-cell="${imageId}"]`).within(() => {
        fbtVisible(imageLabel);
        fbtVisible('Ready');
      });
    });
  });
});
