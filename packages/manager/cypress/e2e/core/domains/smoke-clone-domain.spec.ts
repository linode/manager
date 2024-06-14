import { Domain } from '@linode/api-v4';
import { domainFactory } from '@src/factories';
import { getClick, fbtClick, fbltClick } from 'support/helpers';
import { authenticate } from 'support/api/authentication';
import { randomDomainName } from 'support/util/random';
import { createDomain } from '@linode/api-v4/lib/domains';
import { createDomainRecords } from 'support/constants/domains';
import { interceptCreateDomainRecord } from 'support/intercepts/domains';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';

authenticate();
describe('Clone a Domain', () => {
  before(() => {
    cleanUp('domains');
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
          fbtClick(rec.name);
          rec.fields.forEach((f) => {
            getClick(f.name).type(f.value);
          });
          fbtClick('Save');
          cy.wait('@apiCreateRecord');
        });

        cy.visitWithLogin('/domains');

        // Confirm that domain is listed and initiate deletion.
        cy.findByText(domain.domain)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            ui.actionMenu
              .findByTitle(`Action menu for Domain ${domain}`)
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
              .findByTitle(`Action menu for Domain ${domain}`)
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
            fbltClick('New Domain').type(invalidDomainName);
            ui.buttonGroup
              .findButtonByTitle('Create Domain')
              .should('be.visible')
              .should('be.enabled')
              .click();
            cy.findByText('Domain is not valid.').should('be.visible');

            fbltClick('New Domain').clear().type(clonedDomainName);
            ui.buttonGroup
              .findButtonByTitle('Create Domain')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });
        // After cloning a Domain, the user is redirected to the new Domain's details page
        cy.url().should('endWith', 'domains');

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
