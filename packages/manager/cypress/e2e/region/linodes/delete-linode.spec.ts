import { createLinodeRequestFactory } from '@src/factories';
import { describeRegions } from 'support/util/regions';
import { randomLabel, randomString } from 'support/util/random';
import { Region } from '@linode/api-v4';
import { createLinode } from '@linode/api-v4';
import type { Linode } from '@linode/api-v4';
import { ui } from 'support/ui';
import { authenticate } from 'support/api/authentication';
import {
  interceptGetLinodeDetails,
  interceptGetLinodes,
} from 'support/intercepts/linodes';
import { cleanUp } from 'support/util/cleanup';

authenticate();
describeRegions('Delete Linodes', (region: Region) => {
  before(() => {
    cleanUp('linodes');
  });

  /*
   * - Navigates to a Linode details page.
   * - Deletes the Linode via the "Delete" action menu item.
   * - Navigates back to Linode landing page, confirms deleted Linode is not shown.
   */
  it('can delete a Linode', () => {
    const linodeCreatePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: region.id,
      root_password: randomString(32),
    });

    // Create a Linode before navigating to its details page to delete it.
    cy.defer(
      createLinode(linodeCreatePayload),
      `creating Linode in ${region.label}`
    ).then((linode: Linode) => {
      interceptGetLinodeDetails(linode.id).as('getLinode');
      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.wait('@getLinode');

      // Delete Linode via action menu.
      ui.actionMenu
        .findByTitle(`Action menu for Linode ${linode.label}`)
        .should('be.visible')
        .click();

      ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

      // Confirm deletion via type-to-confirm dialog.
      ui.dialog
        .findByTitle(`Delete ${linode.label}?`)
        .should('be.visible')
        .within(() => {
          cy.findByLabelText('Linode Label')
            .should('be.visible')
            .click()
            .type(linode.label);

          ui.buttonGroup
            .findButtonByTitle('Delete')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      // Confirm that Linode is no longer listed on landing page.
      // Cloud currently does not navigate back to landing page.
      // Remove call to `cy.visitWithLogin()` once redirect is restored.
      interceptGetLinodes().as('getLinodes');
      cy.visitWithLogin('/linodes');
      cy.wait('@getLinodes');
      cy.findByText(linode.label).should('not.exist');
    });
  });
});
