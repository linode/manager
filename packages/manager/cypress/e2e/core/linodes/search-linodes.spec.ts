import { authenticate } from 'support/api/authentication';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';

import type { Linode } from '@linode/api-v4';

authenticate();
describe('Search Linodes', () => {
  beforeEach(() => {
    cleanUp(['linodes']);
    cy.tag('method:e2e');
  });

  /*
   * - Confirm that linodes are searchable and filtered in the UI.
   */
  it('create a linode and make sure it shows up in the table and is searchable in main search tool', () => {
    cy.defer(() =>
      createTestLinode({ booted: true }, { waitForBoot: true })
    ).then((linode: Linode) => {
      cy.visitWithLogin('/linodes');
      cy.get(`[data-qa-linode="${linode.label}"]`)
        .should('be.visible')
        .within(() => {
          cy.contains('Running').should('be.visible');
        });

      // Confirm that linode is listed on the landing page.
      cy.findByText(linode.label).should('be.visible');

      // Use the main search bar to search and filter linode by label
      ui.mainSearch.find().type(linode.label);
      ui.autocompletePopper.findByTitle(linode.label).should('be.visible');

      // Use the main search bar to search and filter linode by id value
      ui.mainSearch.find().clear().type(`${linode.id}`);
      ui.autocompletePopper.findByTitle(linode.label).should('be.visible');

      // Use the main search bar to search and filter linode by id: pattern
      ui.mainSearch.find().clear().type(`id:${linode.id}`);
      ui.autocompletePopper.findByTitle(linode.label).should('be.visible');
    });
  });
});
