import { createFirewall } from '@linode/api-v4';
import { authenticate } from 'support/api/authentication';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { randomLabel } from 'support/util/random';

import { firewallFactory } from 'src/factories/firewalls';

import type { Firewall } from '@linode/api-v4';

authenticate();
// why is this skipped?
describe.skip('delete firewall', () => {
  before(() => {
    cleanUp('firewalls');
  });
  beforeEach(() => {
    cy.tag('method:e2e');
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

    cy.defer(() => createFirewall(firewallRequest), 'creating firewalls').then(
      (firewall: Firewall) => {
        cy.visitWithLogin('/firewalls');

        // Confirm that firewall is listed and initiate deletion.
        cy.findByText(firewall.label)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText('Delete').should('be.visible');
            cy.findByText('Delete').click();
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
            cy.findByText('Delete').should('be.visible');
            cy.findByText('Delete').click();
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
