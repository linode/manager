import { mockImage } from 'cypress/support/api/images';
import { containsClick, fbtClick, getClick } from 'cypress/support/helpers';
import { contains } from 'cypress/types/jquery';
import strings from '../../support/cypresshelpers';

const imageLabel = 'cy-test-image';
const rootpass = strings.randomPass();

describe('create linode from image', () => {
  it('creates linode from image on images tab', () => {
    // mock image setup
    cy.intercept('*/images*', (req) => {
      req.reply(mockImage(imageLabel));
    }).as('mockImage');
    cy.intercept('POST', '*/linode/instances*', (req) => {
      req.reply(mockImage(imageLabel));
    }).as('mockLinode');
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
    cy.get('[id="root-password"]').type(rootpass);
    getClick('[data-qa-deploy-linode="true"]');
  });
});
