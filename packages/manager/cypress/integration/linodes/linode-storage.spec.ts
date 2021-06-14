/* eslint-disable sonarjs/no-duplicate-string */
import { createLinode, deleteAllTestLinodes } from '../../support/api/linodes';
import {
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick,
  getVisible,
} from '../../support/helpers';

const deleteDisk = (diskName, inUse = false) => {
  cy.get(`[aria-label="Action menu for Disk ${diskName}"]`)
    .invoke('attr', 'aria-controls')
    .then(($id) => {
      if ($id) {
        getClick(`[aria-label="Action menu for Disk ${diskName}"]`);
        if (
          cy
            .contains('PROVISIONING', { timeout: 180000 })
            .should('not.exist') &&
          cy.contains('BOOTING', { timeout: 180000 }).should('not.exist') &&
          cy.contains('Resizing', { timeout: 180000 }).should('not.exist')
        ) {
          if (!inUse) {
            getClick(
              `[id="option-2--${$id}"][data-qa-action-menu-item="Delete"]`
            );
            getClick('button[data-qa-confirm-delete="true"]');
          } else {
            cy.get(
              `[id="option-2--${$id}"][data-qa-action-menu-item="Delete"][aria-disabled="true"]`
            ).within(() => {
              cy.get(
                '[title="Your Linode must be fully powered down in order to perform this action"]'
              );
            });
          }
        }
      }
    });
};

const addDisk = (linodeId, diskName) => {
  if (
    cy.contains('PROVISIONING', { timeout: 180000 }).should('not.exist') &&
    cy.contains('BOOTING', { timeout: 180000 }).should('not.exist')
  ) {
    containsVisible('OFFLINE');
    getClick('button[title="Add a Disk"]');
    getVisible('[data-testid="textfield-input"][id="label"]').type(diskName);
    getClick('[value="81920"]').clear().type('1');
    getClick('[data-testid="submit-disk-form"]');
  }
};

describe('linode storage tab', () => {
  it('try to delete in use disk', () => {
    const diskName = 'Debian 10 Disk';
    createLinode().then((linode) => {
      cy.intercept('DELETE', `*/linode/instances/${linode.id}/disks/*`).as(
        'deleteDisk'
      );
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      fbtVisible(diskName);
      cy.get('button[title="Add a Disk"]').should('be.disabled');
      cy.get(`[data-qa-disk="${diskName}"]`).within(() => {
        cy.contains('Resize').should('be.disabled');
      });
      deleteDisk(diskName, true);
      cy.get('button[title="Add a Disk"]').should('be.disabled');
    });
    deleteAllTestLinodes();
  });

  // create with empty disk then delete disk
  it('delete disk', () => {
    const diskName = 'cy-test-disk';
    createLinode({ image: null }).then((linode) => {
      cy.intercept('DELETE', `*/linode/instances/${linode.id}/disks/*`).as(
        'deleteDisk'
      );
      cy.intercept('POST', `*/linode/instances/${linode.id}/disks`).as(
        'addDisk'
      );
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      addDisk(linode.id, diskName);
      fbtVisible(diskName);
      cy.wait('@addDisk').its('response.statusCode').should('eq', 200);
      containsVisible('Resizing');
      deleteDisk(diskName);
      cy.wait('@deleteDisk').its('response.statusCode').should('eq', 200);
      cy.get('button[title="Add a Disk"]').should('be.enabled');
      cy.contains(diskName).should('not.exist');
    });
    deleteAllTestLinodes();
  });

  // create with empty disk then add disk
  it('add a disk', () => {
    const diskName = 'cy-test-disk';
    createLinode({ image: null }).then((linode) => {
      cy.intercept('POST', `*/linode/instances/${linode.id}/disks`).as(
        'addDisk'
      );
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      addDisk(linode.id, diskName);
      fbtVisible(diskName);
      cy.wait('@addDisk').its('response.statusCode').should('eq', 200);
    });
    deleteAllTestLinodes();
  });

  // resize disk
  it('resize disk', () => {
    const diskName = 'Debian 10 Disk';
    createLinode({ image: null }).then((linode) => {
      cy.intercept('POST', `*/linode/instances/${linode.id}/disks`).as(
        'addDisk'
      );
      cy.intercept('POST', `*/linode/instances/${linode.id}/disks/*/resize`).as(
        'resizeDisk'
      );
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      addDisk(linode.id, diskName);
      fbtVisible(diskName);
      cy.wait('@addDisk').its('response.statusCode').should('eq', 200);
      containsVisible('Resizing');
      if (
        cy.contains('PROVISIONING', { timeout: 180000 }).should('not.exist') &&
        cy.contains('BOOTING', { timeout: 180000 }).should('not.exist') &&
        cy.contains('Resizing', { timeout: 180000 }).should('not.exist')
      ) {
        cy.get(`[data-qa-disk="${diskName}"]`).within(() => {
          fbtClick('Resize');
        });
        getClick('[value="1"]').clear().type('2');
        getClick('[data-testid="submit-disk-form"]');
        cy.wait('@resizeDisk').its('response.statusCode').should('eq', 200);
      }
    });
    deleteAllTestLinodes();
  });
});
