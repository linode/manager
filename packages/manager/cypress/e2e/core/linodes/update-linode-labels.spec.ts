import { authenticate } from 'support/api/authentication';
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel } from 'support/util/random';

authenticate();
describe('update linode label', () => {
  beforeEach(() => {
    cleanUp(['linodes']);
    cy.tag('method:e2e');
  });

  it('updates a linode label from details page', () => {
    cy.defer(() => createTestLinode({ booted: true })).then((linode) => {
      const newLinodeLabel = randomLabel();
      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.contains('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
        'be.visible'
      );

      cy.get(`[aria-label="Edit ${linode.label}"]`).click();
      cy.get(`[id="edit-${linode.label}-label"]`).click();
      cy.focused().clear();
      cy.focused().type(`${newLinodeLabel}{enter}`);

      cy.visitWithLogin('/linodes');
      cy.get(`[data-qa-linode="${newLinodeLabel}"]`).should('be.visible');
    });
  });

  it('updates a linode label from the "Settings" tab', () => {
    cy.defer(() => createTestLinode({ booted: true })).then((linode) => {
      const newLinodeLabel = randomLabel();
      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.contains('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
        'be.visible'
      );

      cy.visitWithLogin(`/linodes/${linode.id}/settings`);
      cy.get('[id="label"]').click();
      cy.focused().clear();
      cy.focused().type(`${newLinodeLabel}{enter}`);
      ui.buttonGroup.findButtonByTitle('Save').should('be.visible').click();

      cy.visitWithLogin('/linodes');
      cy.get(`[data-qa-linode="${newLinodeLabel}"]`).should('be.visible');
    });
  });
});
