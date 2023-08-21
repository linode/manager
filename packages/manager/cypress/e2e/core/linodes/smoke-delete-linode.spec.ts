import { authenticate } from 'support/api/authentication';
import { createLinode } from 'support/api/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { apiMatcher } from 'support/util/intercepts';

authenticate();
describe('delete linode', () => {
  before(() => {
    cleanUp('linodes');
  });

  it('deletes linode from linode details page', () => {
    createLinode().then((linode) => {
      // catch delete request
      cy.intercept('DELETE', apiMatcher('linode/instances/*')).as(
        'deleteLinode'
      );
      cy.visitWithLogin(`/linodes/${linode.id}`);

      // Wait for content to load before performing actions via action menu.
      cy.findByText('Stats for this Linode are not available yet');

      // delete linode
      ui.actionMenu
        .findByTitle(`Action menu for Linode ${linode.label}`)
        .should('be.visible')
        .click();

      ui.actionMenuItem
        .findByTitle('Delete')
        .as('deleteButton')
        .should('be.visible');

      cy.get('@deleteButton').click();

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

      // confirm delete
      cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
      cy.url().should('endWith', '/linodes');
      cy.findByText(linode.label).should('not.exist');
    });
  });

  it('deletes linode from linode landing page', () => {
    createLinode().then((linode) => {
      // catch delete request
      cy.intercept('DELETE', apiMatcher('linode/instances/*')).as(
        'deleteLinode'
      );
      cy.visitWithLogin(`/linodes`);

      cy.findByText(linode.label).should('be.visible');

      ui.actionMenu
        .findByTitle(`Action menu for Linode ${linode.label}`)
        .should('be.visible')
        .click();

      ui.actionMenuItem
        .findByTitle('Delete')
        .as('deleteButton')
        .should('be.visible');

      cy.get('@deleteButton').click();

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

      // confirm delete
      cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
      cy.url().should('endWith', '/linodes');
      cy.findByText(linode.label).should('not.exist');
    });
  });
});
