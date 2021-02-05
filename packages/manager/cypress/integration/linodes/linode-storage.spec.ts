/*
Add Disk
Resize Disk
Delete Disk X
Add Volume
Delete Volume
*/

import { clickLinodeActionMenu, createLinode } from '../../support/api/linodes';
import {
  containsVisible,
  fbtClick,
  getClick,
  getVisible
} from '../../support/helpers';
import { assertToast } from '../../support/ui/events';

const deleteDisk = diskName => {
  cy.get(`[aria-label="Action menu for Disk ${diskName}"]`)
    .invoke('attr', 'aria-controls')
    .then($id => {
      if ($id) {
        getClick(`[aria-label="Action menu for Disk ${diskName}"]`);
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
          assertToast(diskName);
        }
      }
    });
};

describe('linode storage tab', () => {
  it.skip('try to delete in use disk', () => {
    createLinode().then(linode => {
      const diskName = '512 MB Swap Image';
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      cy.get('button[title="Add a Disk"]').should('not.exist');
      deleteDisk(diskName);
      getVisible('button[title="Add a Disk"]');
    });
  });

  it('power off and delete not in use disk', () => {
    createLinode().then(linode => {
      const diskName = 'Debian 10 Disk';
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      fbtClick('Power Off');
      fbtClick('Power Off');
      containsVisible('OFFLINE');
      deleteDisk(diskName);
    });
  });
});
