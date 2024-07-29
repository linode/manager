import { createTestLinode } from 'support/util/linodes';
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
    cy.defer(() => createTestLinode({ booted: true })).then((linode) => {
      const newLinodeLabel = randomLabel();
      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.contains('RUNNING').should('be.visible');

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
    cy.defer(() => createTestLinode({ booted: true })).then((linode) => {
      const newLinodeLabel = randomLabel();
      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.contains('RUNNING').should('be.visible');

      cy.visitWithLogin(`/linodes/${linode.id}/settings`);
      cy.get('[id="label"]').click().clear().type(`${newLinodeLabel}{enter}`);
      ui.buttonGroup.findButtonByTitle('Save').should('be.visible').click();

      cy.visitWithLogin('/linodes');
      cy.get(`[data-qa-linode="${newLinodeLabel}"]`).should('be.visible');
    });
  });
});
