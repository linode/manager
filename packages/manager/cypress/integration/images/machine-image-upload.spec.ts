import { createMockImage } from '../../support/api/images';
import { fbtClick, fbtVisible, getClick } from '../../support/helpers';
import 'cypress-file-upload';
import { assertToast } from 'cypress/support/ui/events';
// import { DateTime } from 'luxon';
// import { eventFactory } from '@src/factories';
// import { makeResourcePage } from '@src/mocks/serverHandlers';

const mockImage = createMockImage().data[0];
const imageLabel = mockImage.label;
// const imageId = mockImage.id;
const regionSelect = 'Fremont, CA';
const upload = 'testImage.gz';
// const expiration = DateTime.local().plus({ days: 1 }).toMillis();
// const uploadTo = `https://us-east-1.linodeobjects.com/linode-production-machine-images-uploads/${imageId}?Signature=r7JHoKXKOnECiXnBafCvCCJd%2Fas%3D&Expires=${expiration}&AWSAccessKeyId=ZCD68FKAZ9DW7PAVKOF8`;

describe('upload machine image, mocked', () => {
  it('uploads machine image', () => {
    // TODO: M3-5367
    // cy.intercept('POST', '*/images/upload', (req) => {
    //   req.reply({
    //     upload_to: uploadTo,
    //     image: mockImage,
    //   });
    // }).as('mockUpload');
    // cy.intercept('GET', '*/account/events*', (req) => {
    //   req.reply(
    //     makeResourcePage(
    //       eventFactory.buildList(1, {
    //         action: 'image_upload',
    //         entity: {
    //           label: imageLabel,
    //           id: 99999999,
    //           type: 'image',
    //           url: `/v4/images/${imageId}`,
    //         },
    //         status: 'scheduled',
    //       })
    //     )
    //   );
    // }).as('getEvent');
    // cy.intercept('*/images*', (req) => {
    //   req.reply(createMockImage());
    // }).as('mockImage');

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
    // cy.wait('@mockUpload');
    // cy.wait('@getEvent');
    fbtVisible('testImage');
    assertToast(imageLabel);
    // cy.wait('@mockImage');
    fbtVisible(imageLabel);
  });
});
