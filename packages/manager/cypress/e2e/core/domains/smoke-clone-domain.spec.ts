import { createDomain } from '@linode/api-v4/lib/domains';
import { domainFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { createDomainRecords } from 'support/constants/domains';
import { interceptCreateDomainRecord } from 'support/intercepts/domains';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { randomDomainName } from 'support/util/random';

import type { Domain } from '@linode/api-v4';

authenticate();
describe('Clone a Domain', () => {
  before(() => {
    cleanUp('domains');
  });
  beforeEach(() => {
    cy.tag('method:e2e');
  });

  /*
   * - Clicks "Clone" action menu item for domain but cancels operation.
   * - Clicks "Clone" action menu item for domain and confirms operation.
   * - Confirms that a "Domain is not valid." error is yielded when entering an invalid domain name.
   * - Confirms that the user is redirected to the new Domain's details page after cloning.
   * - Confirms that domain is still in landing page list after canceled operation.
   * - Confirms that cloned domains contain the same records as the original Domain.
   */
  it('clones a domain', () => {
    const domainRequest = domainFactory.build({
      domain: randomDomainName(),
      group: 'test-group',
    });

    const invalidDomainName = 'invalid-domain-name';
    const clonedDomainName = randomDomainName();

    const domainRecords = createDomainRecords();

    cy.defer(() => createDomain(domainRequest), 'creating domain').then(
      (domain: Domain) => {
        // Add records to the domain.
        cy.visitWithLogin(`/domains/${domain.id}`);

        domainRecords.forEach((rec) => {
          interceptCreateDomainRecord().as('apiCreateRecord');
          cy.findByText(rec.name).click();
          rec.fields.forEach((f) => {
            cy.get(f.name).click();
            cy.focused().type(f.value);
          });
          cy.findByText('Save').click();
          cy.wait('@apiCreateRecord');
        });

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
        ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();

        // Cancel cloning when prompted to confirm.
        ui.drawer
          .findByTitle(`Clone Domain`)
          .should('be.visible')
          .within(() => {
            ui.buttonGroup
              .findButtonByTitle('Cancel')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm that no new domain is added and initiate cloning again.
        cy.findByText(domain.domain)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            ui.actionMenu
              .findByTitle(`Action menu for Domain ${domain.domain}`)
              .should('be.visible')
              .click();
          });
        ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();

        // Confirm cloning.
        ui.drawer
          .findByTitle(`Clone Domain`)
          .should('be.visible')
          .within(() => {
            // The button should be disabled before confirming the correct domain
            ui.buttonGroup
              .findButtonByTitle('Create Domain')
              .should('be.visible')
              .should('be.disabled');

            // Confirm that an error is displayed when entering an invalid domain name
            cy.findByLabelText('New Domain').click();
            cy.focused().type(invalidDomainName);
            ui.buttonGroup
              .findButtonByTitle('Create Domain')
              .should('be.visible')
              .should('be.enabled')
              .click();
            cy.findByText('Domain is not valid.').should('be.visible');

            cy.findByLabelText('New Domain').click();
            cy.focused().clear();
            cy.focused().type(clonedDomainName);
            ui.buttonGroup
              .findButtonByTitle('Create Domain')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });
        // After cloning a Domain, the user is redirected to the new Domain's details page
        cy.url().should('match', /\/domains\/\d+$/);

        // Confirm that domain is cloned and cloned domains contain the same records as the original Domain.
        cy.visitWithLogin('/domains');
        cy.findByText(domain.domain).should('be.visible');
        cy.findByText(clonedDomainName).should('be.visible').click();
        domainRecords.forEach((rec) => {
          cy.get(`[aria-label="${rec.tableAriaLabel}"]`).within((_table) => {
            rec.fields.forEach((f) => {
              if (f.skipCheck) {
                return;
              }
              cy.findByText(f.value, { exact: !f.approximate });
            });
          });
        });
      }
    );
  });
});
