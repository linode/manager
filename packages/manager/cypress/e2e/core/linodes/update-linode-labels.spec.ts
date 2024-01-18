import { createLinode } from 'support/api/linodes';
import { containsVisible, fbtVisible } from 'support/helpers';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { authenticate } from 'support/api/authentication';
import { randomLabel } from 'support/util/random';

authenticate();
describe('update linode label', () => {
  beforeEach(() => {
    cleanUp(['linodes']);
  });

  it('updates a linode label from details page', () => {
    createLinode().then((linode) => {
      const newLinodeLabel = randomLabel();
      cy.visitWithLogin(`/linodes/${linode.id}`);
      containsVisible('RUNNING');

      cy.get(`[aria-label="Edit ${linode.label}"]`).click();
      cy.get(`[id="edit-${linode.label}-label"]`)
        .click()
        .clear()
        .type(`${newLinodeLabel}{enter}`);

      cy.visitWithLogin('/linodes');
      cy.get(`[data-qa-linode="${newLinodeLabel}"]`).should('be.visible');
    });
  });

  it('updates a linode label from the "Settings" tab', () => {
    createLinode().then((linode) => {
      const newLinodeLabel = randomLabel();
      cy.visitWithLogin(`/linodes/${linode.id}`);
      containsVisible('RUNNING');

      cy.visitWithLogin(`/linodes/${linode.id}/settings`);
      cy.get('[id="label"]').click().clear().type(`${newLinodeLabel}{enter}`);
      ui.buttonGroup.findButtonByTitle('Save').should('be.visible').click();

      cy.visitWithLogin('/linodes');
      cy.get(`[data-qa-linode="${newLinodeLabel}"]`).should('be.visible');
    });
  });
});
