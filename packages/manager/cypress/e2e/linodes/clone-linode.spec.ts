import {
  createLinode,
  deleteLinodeById,
  deleteLinodeByLabel,
} from '../../support/api/linodes';
import {
  containsClick,
  containsVisible,
  fbtClick,
  getClick,
  getVisible,
} from '../../support/helpers';
import { assertToast } from '../../support/ui/events';

describe('clone linode', () => {
  it('clone linode', () => {
    createLinode({ image: null }).then((linode) => {
      cy.intercept('POST', `*/linode/instances/${linode.id}/clone`).as(
        'cloneLinode'
      );
      cy.visitWithLogin(`/linodes/${linode.id}`);
      containsVisible(linode.label);
      if (
        cy.contains('PROVISIONING', { timeout: 180000 }).should('not.exist') &&
        cy.contains('BOOTING', { timeout: 180000 }).should('not.exist')
      ) {
        getClick(`[aria-label="Action menu for Linode ${linode.label}"]`);
        containsClick('Clone');
        containsClick('Select a Region');
        containsClick('Newark, NJ');
        getVisible('[data-qa-summary]').within(() => {
          containsVisible(linode.label);
        });
        fbtClick('Shared CPU');
        getClick('[id="g6-nanode-1"]');
        getClick('[data-qa-deploy-linode="true"]');
        cy.wait('@cloneLinode').then((xhr) => {
          const newLinodeLabel = xhr.response?.body?.label;
          const newLinodeId = xhr.response?.body?.id;
          assert.equal(xhr.response?.statusCode, 200);
          assertToast(`Your Linode ${newLinodeLabel} is being created.`);
          containsVisible(newLinodeLabel);
        });
      }
    });
  });
});
