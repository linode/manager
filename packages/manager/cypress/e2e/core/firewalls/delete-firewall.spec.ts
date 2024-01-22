import { createFirewall, Firewall } from '@linode/api-v4';
import { firewallFactory } from 'src/factories/firewalls';
import { authenticate } from 'support/api/authentication';
import { randomLabel } from 'support/util/random';
import { ui } from 'support/ui';
import { fbtVisible, fbtClick } from 'support/helpers';
import { cleanUp } from 'support/util/cleanup';

authenticate();
describe('delete firewall', () => {
  before(() => {
    cleanUp('firewalls');
  });

  /*
   * - Clicks "Delete" action menu item for firewall but cancels operation.
   * - Clicks "Delete" action menu item for firewall and confirms operation.
   * - Confirms that firewall is still in landing page list after canceled operation.
   * - Confirms that firewall is removed from landing page list after confirmed operation.
   */
  it('deletes a firewall', () => {
    const firewallRequest = firewallFactory.build({
      label: randomLabel(),
    });

    cy.defer(createFirewall(firewallRequest), 'creating firewalls').then(
      (firewall: Firewall) => {
        cy.visitWithLogin('/firewalls');

        // Confirm that firewall is listed and initiate deletion.
        cy.findByText(firewall.label)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            fbtVisible('Delete');
            fbtClick('Delete');
          });

        // Cancel deletion when prompted to confirm.
        ui.dialog
          .findByTitle(`Delete Firewall ${firewall.label}?`)
          .should('be.visible')
          .within(() => {
            ui.buttonGroup
              .findButtonByTitle('Cancel')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm that firewall is still listed and initiate deletion again.
        cy.findByText(firewall.label)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            fbtVisible('Delete');
            fbtClick('Delete');
          });

        // Confirm deletion.
        ui.dialog
          .findByTitle(`Delete Firewall ${firewall.label}?`)
          .should('be.visible')
          .within(() => {
            ui.buttonGroup
              .findButtonByTitle('Delete Firewall')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm that firewall is deleted.
        cy.visitWithLogin('/firewalls');
        cy.findByText(firewall.label).should('not.exist');
      }
    );
  });
});
