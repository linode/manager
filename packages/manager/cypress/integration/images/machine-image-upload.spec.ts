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
const expiration = DateTime.local().plus({ days: 1 }).toMillis();
const uploadTo = `https://us-east-1.linodeobjects.com/linode-production-machine-images-uploads/${imageId}?Signature=r7JHoKXKOnECiXnBafCvCCJd%2Fas%3D&Expires=${expiration}&AWSAccessKeyId=ZCD68FKAZ9DW7PAVKOF8`;

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

describe('machine image', () => {
  it('uploads machine image', () => {
    cy.intercept('POST', '*/images/upload').as('imageUpload');
    uploadImage();
    cy.wait('@imageUpload');
    fbtVisible('testImage');
    fbtVisible(imageLabel);
  });

  it('uploads machine image, mock failed event', () => {
    uploadImage();
    cy.intercept('GET', '*/account/events*', (req) => {
      req.reply(
        makeResourcePage(
          eventFactory.buildList(1, {
            action: 'image_upload',
            entity: {
              label: imageLabel,
              id: 99999999,
              type: 'image',
              url: `/v4/images/${imageId}`,
            },
            status: 'failed',
            message: 'Forced Fail Via Mock',
          })
        )
      );
    }).as('getEvent');
    cy.wait('@getEvent');
    assertToast(
      'There was a problem processing image cy-test-image: Forced Fail Via Mock'
    );
  });
});
