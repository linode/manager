/* eslint-disable sonarjs/no-duplicate-string */
import { Linode } from '@linode/api-v4/types';
import { createLinode } from 'support/api/linodes';
import {
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick,
  getVisible,
} from 'support/helpers';
import { apiMatcher } from 'support/util/intercepts';
import { ui } from 'support/ui';

// 3 minutes.
const linodeProvisionTimeout = 180000;

const waitForProvision = () => {
  cy.findByText('PROVISIONING', { timeout: linodeProvisionTimeout }).should(
    'not.exist'
  );
  cy.findByText('BOOTING', { timeout: linodeProvisionTimeout }).should(
    'not.exist'
  );
  cy.findByText('Creating', { timeout: linodeProvisionTimeout }).should(
    'not.exist'
  );
};

const deleteInUseDisk = (diskName) => {
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

  // TODO Re-enable interactions/assertions related to help tooltip once button issue is resolved.

  // // The 'have.attr' assertion changes the Cypress subject to the value of the attr.
  // // Using `cy.get()` against the alias reselects the item.
  // cy.get('@deleteMenuItem')
  //   .within(() => {
  //     ui.button
  //       .findByAttribute('data-qa-help-button', 'true')
  //       .should('be.visible')
  //       .should('be.enabled')
  //       .click();
  //   });

  // cy.findByText('Your Linode must be fully powered down in order to perform this action')
  //   .should('be.visible');
};

const deleteDisk = (diskName, inUse = false) => {
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
      cy.intercept(
        'DELETE',
        apiMatcher(`linode/instances/${linode.id}/disks/*`)
      ).as('deleteDisk');
      // Wait for Linode to boot before navigating to `Storage` details tab.
      // Navigate via `cy.visitWithLogin` to invoke a page refresh.
      // @TODO Remove this step upon resolution of M3-5762.
      cy.visitWithLogin(`/linodes/${linode.id}`);
      containsVisible('RUNNING');
      cy.visitWithLogin(`linodes/${linode.id}/storage`);
      fbtVisible(diskName);
      cy.get('button[title="Add a Disk"]').should('be.disabled');
      cy.get(`[data-qa-disk="${diskName}"]`).within(() => {
        cy.contains('Resize').should('be.disabled');
      });
      deleteInUseDisk(diskName);
      cy.get('button[title="Add a Disk"]').should('be.disabled');
    });
  });

  // create with empty disk then delete disk
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
      addDisk(linode.id, diskName);
      fbtVisible(diskName);
      cy.wait('@addDisk').its('response.statusCode').should('eq', 200);
      containsVisible('Creating');
      deleteDisk(diskName);
      cy.wait('@deleteDisk').its('response.statusCode').should('eq', 200);
      cy.get('button[title="Add a Disk"]').should('be.enabled');
      cy.findByLabelText('List of Disks').within(() => {
        cy.contains(diskName).should('not.exist');
      });
    });
  });

  // create with empty disk then add disk
  it('add a disk', () => {
    const diskName = 'cy-test-disk';
    createLinode({ image: null }).then((linode: Linode) => {
      cy.intercept(
        'POST',
        apiMatcher(`/linode/instances/${linode.id}/disks`)
      ).as('addDisk');
      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      addDisk(linode.id, diskName);
      fbtVisible(diskName);
      cy.wait('@addDisk').its('response.statusCode').should('eq', 200);
    });
  });

  // resize disk
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
      addDisk(linode.id, diskName);
      fbtVisible(diskName);
      cy.wait('@addDisk').its('response.statusCode').should('eq', 200);
      containsVisible('Creating');
      if (
        cy.contains('PROVISIONING', { timeout: 180000 }).should('not.exist') &&
        cy.contains('BOOTING', { timeout: 180000 }).should('not.exist') &&
        cy.contains('Creating', { timeout: 180000 }).should('not.exist')
      ) {
        cy.get(`[data-qa-disk="${diskName}"]`).within(() => {
          fbtClick('Resize');
        });
        getClick('[value="1"]').clear().type('2');
        getClick('[data-testid="submit-disk-form"]');
        cy.wait('@resizeDisk').its('response.statusCode').should('eq', 200);
      }
    });
  });
});
