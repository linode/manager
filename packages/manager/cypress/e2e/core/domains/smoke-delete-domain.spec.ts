import { createDomain } from '@linode/api-v4/lib/domains';
import { domainFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { ui } from 'support/ui';
import { randomDomainName } from 'support/util/random';

import type { Domain } from '@linode/api-v4';

authenticate();
beforeEach(() => {
  cy.tag('method:e2e');
});
describe('Delete a Domain', () => {
  /*
   * - Clicks "Delete" action menu item for domain but cancels operation.
   * - Clicks "Delete" action menu item for domain and confirms operation.
   * - Confirms that domain is still in landing page list after canceled operation.
   * - Confirms that domain is removed from landing page list after confirmed operation.
   */
  it('deletes a domain', () => {
    const domainRequest = domainFactory.build({
      domain: randomDomainName(),
      group: 'test-group',
    });

    cy.defer(() => createDomain(domainRequest), 'creating domain').then(
      (domain: Domain) => {
        cy.visitWithLogin('/domains');

        // Confirm that domain is listed and initiate deletion.
        cy.findByText(domain.domain)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            ui.actionMenu
              .findByTitle(`Action menu for Domain ${domain.domain}`)
              .should('be.visible')
              .click();
          });
        ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

        // Cancel deletion when prompted to confirm.
        ui.dialog
          .findByTitle(`Delete Domain ${domain.domain}?`)
          .should('be.visible')
          .within(() => {
            ui.buttonGroup
              .findButtonByTitle('Cancel')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm that domain is still listed and initiate deletion again.
        cy.findByText(domain.domain)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            ui.actionMenu
              .findByTitle(`Action menu for Domain ${domain.domain}`)
              .should('be.visible')
              .click();
          });
        ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

        // Confirm deletion.
        ui.dialog
          .findByTitle(`Delete Domain ${domain.domain}?`)
          .should('be.visible')
          .within(() => {
            // The button should be disabled before confirming the correct domain
            ui.buttonGroup
              .findButtonByTitle('Delete Domain')
              .should('be.visible')
              .should('be.disabled');
            cy.contains('Domain Name').click();
            cy.focused().type(domain.domain);

            ui.buttonGroup
              .findButtonByTitle('Delete Domain')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm that domain is deleted.
        cy.visitWithLogin('/domains');
        cy.findByText(domain.domain).should('not.exist');
      }
    );
  });
});
