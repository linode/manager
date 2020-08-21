import { makeImageLabel, deleteAllTestImages } from '../../support/api/images';
import { createLinode } from '../../support/api/linodes';

describe('create linode', () => {
  it('creates first image', () => {
    cy.server();
    cy.route({
      method: 'GET',
      url: '/v4/images*',
      response: {
        results: 0,
        data: [],
        page: 1,
        pages: 1
      }
    }).as('getImages');
    createLinode().then(linode => {
      cy.visitWithLogin('/images');
      cy.wait('@getImages');
      const imageLabel = makeImageLabel();
      cy.findAllByRole('button')
        .filter(':contains("Add an Image")')
        .click();

      cy.findByText('Select a Linode').type(`${linode.label}{enter}`);
      cy.findByText('Select a Disk')
        .click()
        .type('{enter}');

      cy.findAllByLabelText('Label').type(`${imageLabel}{enter}`);
      // Line should be removed once bug fixed
      cy.findByText('Snap', { exact: false, timeout: 1000 }).should('not.exist');
      // here we should also stube the post to catch the call
    //   cy.findByText('Create')
    //     .should('be.visible', { timeout: 100 })
    //     .click();
    });

    deleteAllTestImages();
  });
});
