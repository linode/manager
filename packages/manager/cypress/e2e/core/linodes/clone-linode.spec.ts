import { createLinode } from 'support/api/linodes';
import {
  containsClick,
  containsVisible,
  fbtClick,
  getClick,
  getVisible,
} from 'support/helpers';
import { ui } from 'support/ui';
import { apiMatcher } from 'support/util/intercepts';

describe('clone linode', () => {
  it('clone linode', () => {
    createLinode({ image: null }).then((linode) => {
      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/clone`)
      ).as('cloneLinode');
      cy.visitWithLogin(`/linodes/${linode.id}`);
      containsVisible(linode.label);
      if (
        cy.contains('PROVISIONING', { timeout: 180000 }).should('not.exist') &&
        cy.contains('BOOTING', { timeout: 180000 }).should('not.exist')
      ) {
        ui.actionMenu
          .findByTitle(`Action menu for Linode ${linode.label}`)
          .should('be.visible')
          .click();

        ui.actionMenuItem.findByTitle('Clone').should('be.visible').click();

        cy.contains('Select a Region')
          .should('be.visible')
          .click()
          .type(`Newark, NJ{enter}`);

        getVisible('[data-qa-summary]').within(() => {
          containsVisible(linode.label);
        });
        fbtClick('Shared CPU');
        getClick('[id="g6-nanode-1"]');
        getClick('[data-qa-deploy-linode="true"]');
        cy.wait('@cloneLinode').then((xhr) => {
          const newLinodeLabel = xhr.response?.body?.label;
          assert.equal(xhr.response?.statusCode, 200);
          ui.toast.assertMessage(
            `Your Linode ${newLinodeLabel} is being created.`
          );
          containsVisible(newLinodeLabel);
        });
      }
    });
  });
});
