/* eslint-disable sonarjs/no-duplicate-string */
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';
import { Linode } from '@linode/api-v4';
import { authenticate } from 'support/api/authentication';
import { createTestLinode } from 'support/util/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import {
  interceptDeleteDisks,
  interceptAddDisks,
  interceptResizeDisks,
} from 'support/intercepts/linodes';

/**
 * Waits for a Linode to finish provisioning by checking the details page status indicator.
 */
const waitForProvision = () => {
  cy.findByText('PROVISIONING', { timeout: LINODE_CREATE_TIMEOUT }).should(
    'not.exist'
  );
  cy.findByText('BOOTING', { timeout: LINODE_CREATE_TIMEOUT }).should(
    'not.exist'
  );
  cy.findByText('Creating', { timeout: LINODE_CREATE_TIMEOUT }).should(
    'not.exist'
  );
};

// Size values (in MB) to use when creating and resizing disks.
const DISK_CREATE_SIZE_MB = 512;
const DISK_RESIZE_SIZE_MB = 768;

/**
 * Deletes an in-use disk of the given name.
 *
 * @param diskName - Name of disk to attempt to delete.
 */
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

/**
 * Deletes a disk of the given name.
 *
 * @param diskName - Name of disk to delete.
 */
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

/**
 * Adds a new disk with the given name and optional size.
 *
 * If `diskSize` is not specified, the new disk will be 512MB.
 *
 * @param diskName - Name of new disk.
 * @param diskSize - Size of new disk in megabytes.
 */
const addDisk = (diskName: string, diskSize: number = DISK_CREATE_SIZE_MB) => {
  cy.contains('PROVISIONING', { timeout: LINODE_CREATE_TIMEOUT }).should(
    'not.exist'
  );
  cy.contains('BOOTING', { timeout: LINODE_CREATE_TIMEOUT }).should(
    'not.exist'
  );
  cy.contains('OFFLINE', { timeout: LINODE_CREATE_TIMEOUT }).should(
    'be.visible'
  );

  ui.button.findByTitle('Add a Disk').click();

  ui.drawer
    .findByTitle('Create Disk')
    .should('be.visible')
    .within(() => {
      cy.findByLabelText('Label (required)').type(diskName);
      cy.findByLabelText('Size (required)').clear();
      cy.focused().type(`${diskSize}`);
      ui.button.findByTitle('Create').click();
    });

  ui.toast.assertMessage(`Started creation of disk ${diskName}`);
};

authenticate();
beforeEach(() => {
  cy.tag('method:e2e');
});
describe('linode storage tab', () => {
  before(() => {
    cleanUp(['linodes', 'lke-clusters']);
  });

  /*
   * - Confirms UI flow end-to-end when a user attempts to delete a Linode disk that's in use.
   * - Confirms that error occurs and user is informed that they must power down their Linode.
   */
  it('try to delete in use disk', () => {
    const diskName = 'Ubuntu 24.04 LTS Disk';
    cy.defer(() => createTestLinode({ booted: true })).then((linode) => {
      interceptDeleteDisks(linode.id).as('deleteDisk');
      cy.visitWithLogin(`linodes/${linode.id}/storage`);
      cy.contains('RUNNING', { timeout: LINODE_CREATE_TIMEOUT });
      cy.findByText(diskName).should('be.visible');

      ui.button.findByTitle('Add a Disk').should('be.disabled');

      cy.get(`[data-qa-disk="${diskName}"]`).within(() => {
        cy.contains('Resize').should('be.disabled');
      });

      deleteInUseDisk(diskName);

      ui.button.findByTitle('Add a Disk').should('be.disabled');
    });
  });

  /*
   * - Confirms UI flow end-to-end when a user deletes a Linode disk.
   * - Confirms that user can successfully delete a disk from a Linode.
   * - Confirms that Cloud Manager UI automatically updates to reflect deleted disk.
   */
  it('delete disk', () => {
    const diskName = 'cy-test-disk';
    cy.defer(() => createTestLinode({ image: null })).then((linode) => {
      interceptDeleteDisks(linode.id).as('deleteDisk');
      interceptAddDisks(linode.id).as('addDisk');
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      addDisk(diskName);
      cy.findByText(diskName).should('be.visible');
      cy.wait('@addDisk').its('response.statusCode').should('eq', 200);
      // Disk should show "Creating". We must wait for it to finish "Creating" before we try to delete the disk
      cy.findByText('Creating', { exact: false }).should('be.visible');
      // "Creating" should go away when the Disk is able to be deleted
      cy.findByText('Creating', { exact: false }).should('not.exist');
      deleteDisk(diskName);
      cy.wait('@deleteDisk').its('response.statusCode').should('eq', 200);
      cy.findByText('Deleting', { exact: false }).should('be.visible');
      ui.button.findByTitle('Add a Disk').should('be.enabled');
      ui.toast.assertMessage(
        `Disk ${diskName} on Linode ${linode.label} has been deleted.`
      );
      cy.findByLabelText('List of Disks').within(() => {
        cy.contains(diskName).should('not.exist');
      });
    });
  });

  /*
   * - Confirms UI flow when user adds a disk to a Linode.
   * - Confirms that Cloud Manager UI automatically updates to reflect new disk.
   */
  it('add a disk', () => {
    const diskName = 'cy-test-disk';
    cy.defer(() => createTestLinode({ image: null })).then((linode: Linode) => {
      interceptAddDisks(linode.id).as('addDisk');
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      addDisk(diskName);
      cy.findByText(diskName).should('be.visible');
      cy.wait('@addDisk').its('response.statusCode').should('eq', 200);
    });
  });

  /*
   * - Confirms UI flow when a user resizes an existing disk.
   * - Confirms that Cloud Manager UI automatically updates to reflect resize.
   */
  it('resize disk', () => {
    const diskName = 'Debian 12 Disk';
    cy.defer(() =>
      createTestLinode({ image: null }, { securityMethod: 'powered_off' })
    ).then((linode: Linode) => {
      interceptAddDisks(linode.id).as('addDisk');
      interceptResizeDisks(linode.id).as('resizeDisk');
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      waitForProvision();
      addDisk(diskName);

      cy.findByText(diskName).should('be.visible');
      cy.wait('@addDisk').its('response.statusCode').should('eq', 200);

      cy.findByLabelText('List of Disks').within(() => {
        // Confirm that "Creating" message appears then disappears.
        cy.contains('Creating').should('be.visible');
        cy.contains('Creating').should('not.exist');
      });

      cy.get(`[data-qa-disk="${diskName}"]`).within(() => {
        cy.findByText('Resize').should('be.visible').click();
      });

      ui.drawer
        .findByTitle(`Resize ${diskName}`)
        .should('be.visible')
        .within(() => {
          cy.findByLabelText('Size (required)').clear();
          cy.focused().type(`${DISK_RESIZE_SIZE_MB}`);
          ui.button.findByTitle('Resize').click();
        });

      cy.wait('@resizeDisk').its('response.statusCode').should('eq', 200);
      ui.toast.assertMessage('Disk queued for resizing.');
      ui.toast.assertMessage(
        `Disk ${diskName} on Linode ${linode.label} has been resized.`
      );
    });
  });
});
