/* eslint-disable sonarjs/no-duplicate-string */
import { Linode } from '@linode/api-v4/types';
import { authenticate } from 'support/api/authentication';
import { createLinode } from 'support/api/linodes';
import { containsVisible, fbtClick, fbtVisible } from 'support/helpers';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { apiMatcher } from 'support/util/intercepts';

// 3 minutes.
const LINODE_PROVISION_TIMEOUT = 180_000;

const waitForProvision = () => {
  cy.findByText('PROVISIONING', { timeout: LINODE_PROVISION_TIMEOUT }).should(
    'not.exist'
  );
  cy.findByText('BOOTING', { timeout: LINODE_PROVISION_TIMEOUT }).should(
    'not.exist'
  );
  cy.findByText('Creating', { timeout: LINODE_PROVISION_TIMEOUT }).should(
    'not.exist'
  );
};

const deleteInUseDisk = (diskName: string) => {
  waitForProvision();

  ui.actionMenu
    .findByTitle(`Action menu for Disk ${diskName}`)
    .should('be.visible')
    .click();

  ui.actionMenuItem
    .findByTitle('Delete')
    .should('be.visible')
    .as('deleteMenuItem')
    .should('have.attr', 'aria-disabled');

  // The 'have.attr' assertion changes the Cypress subject to the value of the attr.
  // Using `cy.get()` against the alias reselects the item.
  cy.get('@deleteMenuItem').within(() => {
    ui.button
      .findByAttribute('data-qa-help-button', 'true')
      .should('be.visible')
      .should('be.enabled')
      .click();
  });

  cy.findByText(
    'Your Linode must be fully powered down in order to perform this action'
  ).should('be.visible');
};

const deleteDisk = (diskName: string) => {
  waitForProvision();

  ui.actionMenu
    .findByTitle(`Action menu for Disk ${diskName}`)
    .should('be.visible')
    .click();

  ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

  ui.dialog
    .findByTitle('Confirm Delete')
    .should('be.visible')
    .within(() => {
      ui.button
        .findByTitle('Delete')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });
};

const addDisk = (diskName: string) => {
  cy.contains('PROVISIONING', { timeout: LINODE_PROVISION_TIMEOUT }).should(
    'not.exist'
  );
  cy.contains('BOOTING', { timeout: LINODE_PROVISION_TIMEOUT }).should(
    'not.exist'
  );
  containsVisible('OFFLINE');

  ui.button.findByTitle('Add a Disk').click();

  ui.drawer
    .findByTitle('Create Disk')
    .should('be.visible')
    .within(() => {
      cy.findByLabelText('Label (required)').type(diskName);
      cy.findByLabelText('Size (required)').clear().type('1');
      ui.button.findByTitle('Create').click();
    });

  ui.toast.assertMessage(`Started creation of disk ${diskName}`);
};

authenticate();
describe('linode storage tab', () => {
  before(() => {
    cleanUp(['linodes', 'lke-clusters']);
  });

  it('try to delete in use disk', () => {
    const diskName = 'Debian 10 Disk';
    createLinode().then((linode) => {
      cy.intercept(
        'DELETE',
        apiMatcher(`linode/instances/${linode.id}/disks/*`)
      ).as('deleteDisk');
      cy.visitWithLogin(`linodes/${linode.id}/storage`);
      containsVisible('RUNNING');
      fbtVisible(diskName);

      ui.button.findByTitle('Add a Disk').should('be.disabled');

      cy.get(`[data-qa-disk="${diskName}"]`).within(() => {
        cy.contains('Resize').should('be.disabled');
      });

      deleteInUseDisk(diskName);

      ui.button.findByTitle('Add a Disk').should('be.disabled');
    });
  });

  it('delete disk', () => {
    const diskName = 'cy-test-disk';
    createLinode({ image: null }).then((linode: Linode) => {
      cy.intercept(
        'DELETE',
        apiMatcher(`linode/instances/${linode.id}/disks/*`)
      ).as('deleteDisk');
      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/disks`)
      ).as('addDisk');
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      addDisk(diskName);
      fbtVisible(diskName);
      cy.wait('@addDisk').its('response.statusCode').should('eq', 200);
      // Disk should show "Creating". We must wait for it to finish "Creating" before we try to delete the disk
      cy.findByText('Creating', { exact: false }).should('be.visible');
      // "Creating" should go away when the Disk is able to be deleted
      cy.findByText('Creating', { exact: false }).should('not.exist');
      deleteDisk(diskName);
      cy.wait('@deleteDisk').its('response.statusCode').should('eq', 200);
      cy.findByText('Deleting', { exact: false }).should('be.visible');
      ui.button.findByTitle('Add a Disk').should('be.enabled');
      ui.toast.assertMessage(`Disk ${diskName} deleted successfully.`);
      cy.findByLabelText('List of Disks').within(() => {
        cy.contains(diskName).should('not.exist');
      });
    });
  });

  it('add a disk', () => {
    const diskName = 'cy-test-disk';
    createLinode({ image: null }).then((linode: Linode) => {
      cy.intercept(
        'POST',
        apiMatcher(`/linode/instances/${linode.id}/disks`)
      ).as('addDisk');
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      addDisk(diskName);
      fbtVisible(diskName);
      cy.wait('@addDisk').its('response.statusCode').should('eq', 200);
    });
  });

  it('resize disk', () => {
    const diskName = 'Debian 10 Disk';
    createLinode({ image: null }).then((linode: Linode) => {
      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/disks`)
      ).as('addDisk');
      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/disks/*/resize`)
      ).as('resizeDisk');
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      addDisk(diskName);
      fbtVisible(diskName);
      cy.wait('@addDisk').its('response.statusCode').should('eq', 200);
      containsVisible('Creating');
      cy.contains('PROVISIONING', { timeout: LINODE_PROVISION_TIMEOUT }).should(
        'not.exist'
      );
      cy.contains('BOOTING', { timeout: LINODE_PROVISION_TIMEOUT }).should(
        'not.exist'
      );
      cy.contains('Creating', { timeout: LINODE_PROVISION_TIMEOUT }).should(
        'not.exist'
      );
      cy.get(`[data-qa-disk="${diskName}"]`).within(() => {
        fbtClick('Resize');
      });

      ui.drawer
        .findByTitle(`Resize ${diskName}`)
        .should('be.visible')
        .within(() => {
          cy.findByLabelText('Size (required)').clear().type('2');
          ui.button.findByTitle('Resize').click();
        });

      cy.wait('@resizeDisk').its('response.statusCode').should('eq', 200);
      ui.toast.assertMessage('Disk queued for resizing.');
      // cy.findByText('Resizing', { exact: false }).should('be.visible');
      ui.toast.assertMessage(`Disk ${diskName} resized successfully.`);
    });
  });
});
