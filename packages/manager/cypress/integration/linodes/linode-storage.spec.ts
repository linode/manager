/*
Add Disk 
Resize Disk
Delete Disk X
Add Volume
Delete Volume
*/

import { clickLinodeActionMenu, createLinode } from '../../support/api/linodes';
import { getClick, getVisible } from '../../support/helpers';

describe('linode storage tab', () => {
  it('delete and add disk', () => {
    createLinode().then(linode => {
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      cy.get('button[title="Add a Disk"]').should('not.exist');
      cy.get(`[aria-label="Action menu for Disk Debian 10 Disk"]`)
        .invoke('attr', 'aria-controls')
        .then($id => {
          if ($id) {
            getClick(`[aria-label="Action menu for Disk Debian 10 Disk"]`);
            if (
              cy
                .contains('PROVISIONING', { timeout: 180000 })
                .should('not.exist') &&
              cy.contains('BOOTING', { timeout: 180000 }).should('not.exist')
            ) {
              getClick(
                `[id="option-2--${$id}"][data-qa-action-menu-item="Delete"]`
              );
              getClick('button[data-qa-confirm-delete="true"]');
              getClick('button[title="Add a Disk"]');
            }
          }
        });
    });
  });
});
