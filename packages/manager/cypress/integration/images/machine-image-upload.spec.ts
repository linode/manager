import { createMockImage } from '../../support/api/images';
import { fbtClick, fbtVisible, getClick } from '../../support/helpers';
import 'cypress-file-upload';
import { assertToast } from 'cypress/support/ui/events';

const mockImage = createMockImage().data[0];
const imageLabel = mockImage.label;
const regionSelect = 'Fremont, CA';
const upload = 'testImage.gz';

describe('upload machine image, mocked', () => {
  it('uploads machine image', () => {
    cy.intercept('POST', '*/images/upload', (req) => {
      req.reply({
        upload_to:
          'https://us-east-1.linodeobjects.com:443/linode-production-machine-images-uploads/13231316?Signature=r7JHoKXKOnECiXnBafCvCCJd%2Fas%3D&Expires=1627746167&AWSAccessKeyId=ZCD68FKAZ9DW7PAVKOF8',
        image: mockImage,
      });
    }).as('mockUpload');

    cy.intercept('*/images*', (req) => {
      req.reply(createMockImage());
    }).as('mockImage');

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
    cy.wait('@mockUpload');
    fbtVisible('testImage');
    assertToast(imageLabel);
    cy.wait('@mockImage');
    fbtVisible(imageLabel);
  });
});
