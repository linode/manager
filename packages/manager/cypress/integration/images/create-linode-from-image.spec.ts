import { mockImage } from 'cypress/support/api/images';
import { containsClick, fbtClick, getClick } from 'cypress/support/helpers';
import { contains } from 'cypress/types/jquery';

const imageLabel = 'cy-test-image';

describe('create linode from image', () => {
  it('creates linode from image on images tab', () => {
    // mock image setup
    cy.intercept('*/images*', (req) => {
      req.reply(mockImage(imageLabel));
    }).as('mockImage');
    cy.visitWithLogin('/linodes/create?type=Images');
    cy.wait('@mockImage');

    cy.get('[data-qa-enhanced-select="Choose an image"]').within(() => {
      containsClick('Choose an image');
    });
    fbtClick(imageLabel);

    getClick('[data-qa-enhanced-select="Select a Region"]').within(() => {
      containsClick('Select a Region');
    });
    containsClick('Fremont, CA');

    getClick('[id="g6-nanode-1"][type="radio"]');
  });
});
