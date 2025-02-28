import type { Linode } from '@linode/api-v4';
import { authenticate } from 'support/api/authentication';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel, randomPhrase } from 'support/util/random';

authenticate();
describe('create image (e2e)', () => {
  before(() => {
    cleanUp(['linodes', 'images']);
  });

  it('create image from a linode', () => {
    cy.tag('method:e2e');
    const label = randomLabel();
    const description = randomPhrase();

    // When Alpine 3.20 becomes deprecated, we will have to update these values for the test to pass.
    const image = 'linode/alpine3.20';
    const disk = 'Alpine 3.20 Disk';

    cy.defer(
      () => createTestLinode({ image }, { waitForDisks: true }),
      'create linode'
    ).then((linode: Linode) => {
      cy.visitWithLogin('/images/create');

      // Find the Linode select and open it
      cy.findByLabelText('Linode')
        .should('be.visible')
        .should('be.enabled')
        .should('have.attr', 'placeholder', 'Select a Linode')
        .click();
      cy.focused().type(linode.label);

      // Select the Linode
      ui.autocompletePopper
        .findByTitle(linode.label)
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Find the Disk select and open it
      cy.findByLabelText('Disk')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Select the Linode disk
      ui.autocompletePopper.findByTitle(disk).should('be.visible').click();

      // Give the Image a label
      cy.findByLabelText('Label')
        .should('be.enabled')
        .should('be.visible')
        .clear();
      cy.focused().type(label);

      // Give the Image a description
      cy.findByLabelText('Description')
        .should('be.enabled')
        .should('be.visible')
        .type(description);

      // Submit the image create form
      ui.button
        .findByTitle('Create Image')
        .should('be.enabled')
        .should('have.attr', 'type', 'submit')
        .click();

      ui.toast.assertMessage('Image scheduled for creation.');

      // Verify we redirect to the images landing page upon successful creation
      cy.url().should('endWith', 'images');

      // Verify the newly created image shows on the Images landing page
      cy.findByText(label)
        .closest('tr')
        .within(() => {
          // Verify Image label shows
          cy.findByText(label).should('be.visible');
          // Verify Image has status of "Creating"
          cy.findByText('Creating', { exact: false }).should('be.visible');
        });
    });
  });
});
