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
      createTestLinode({ booted: false }, { waitForBoot: false })
    ).then((linode: Linode) => {
      cy.visitWithLogin('/linodes?order=desc&orderBy=created');

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

      // Verify the Linode shows as an option in the main search autocomplete
      ui.autocompletePopper.findByTitle(linode.label).should('be.visible');

      // Press Enter to go to the search page
      cy.focused().type('{enter}');

      // Verify the search field still has the correct search query that the user typed
      ui.mainSearch
        .find()
        .findByRole('combobox')
        .should('have.value', `id:${linode.id}`);

      // Verify we land on the search page
      cy.url().should('endWith', `/search?query=id%3A${linode.id}`);
      cy.findByText(`Search Results for "id:${linode.id}"`).should(
        'be.visible'
      );
    });
  });
});
