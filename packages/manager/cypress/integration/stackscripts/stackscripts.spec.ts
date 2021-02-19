import { makeTestLabel } from '../../support/api/common';
import {
  fbtClick,
  fbtVisible,
  getClick,
  getVisible
} from '../../support/helpers';
import strings from '../../support/cypresshelpers';
import { deleteAllTestStackscripts } from '../../support/api/stackscripts';
import {
  deleteAllTestLinodes,
  deleteLinodeByLabel
} from '../../support/api/linodes';

const createLinodeBasic = () => {
  const password = strings.randomPass();
  fbtClick('Select a Region');
  fbtClick('Newark, NJ');
  getClick('[id="g6-nanode-1"]');
  getClick('[id="root-password"]').type(password);
  getClick('[data-qa-deploy-linode]');
};

const createLinodeFromSs = (community: boolean = false) => {
  fbtVisible('Create From:');
  if (community) {
    getClick('[id="serverid"]').type(strings.randomPass());
    getClick('[id="service-secret"]').type(strings.randomPass());
    fbtClick('Choose an image');
    cy.get('[data-qa-option]')
      .first()
      .click();
  }
  createLinodeBasic();
};

describe('stackscripts', () => {
  it('create stackscript, use it to deploy linode', () => {
    const disk = 'Alpine 3.10';
    cy.intercept('POST', `*/linode/instances`).as('createLinode');
    const ssLabel = makeTestLabel();
    cy.visitWithLogin('/stackscripts');
    cy.url().should('endWith', '/account');
    fbtVisible('Create a StackScript').click();
    getClick('[id="stackscript-label"]').type(ssLabel);
    getClick('[data-qa-multi-select="Select an Image"]').type(
      `${disk} {enter}`
    );
    getClick('[data-qa-stackscript-script="true"]').type('#!/bin/bash');
    getClick('[data-qa-save="true"]');
    fbtVisible(ssLabel);
    getVisible(`[data-qa-table-row="${ssLabel}"]`).within(() => {
      fbtClick('Deploy New Linode');
    });
    createLinodeFromSs();
    cy.wait('@createLinode', { timeout: 300000 }).then(linode => {
      cy.visit(`/linodes/${linode.response?.body.id}/storage`);
      fbtVisible(linode.response?.body.label);
    });
    cy.contains('RUNNING', { timeout: 300000 });
    cy.reload();
    fbtVisible(`${disk} Disk`);
    deleteAllTestLinodes();
    deleteAllTestStackscripts();
  });

  it('use community stackscript to deploy linode', () => {
    cy.intercept('POST', `*/linode/instances`).as('createLinode');
    cy.visitWithLogin('/stackscripts');
    cy.url().should('endWith', '/account');
    fbtClick('Community StackScripts');
    cy.contains('Deploy New Linode')
      .first()
      .click();
    createLinodeFromSs(true);
    cy.wait('@createLinode', { timeout: 300000 }).then(linode => {
      cy.visit(`/linodes/${linode.response?.body.id}/storage`);
      fbtVisible(linode.response?.body.label);
      cy.contains('RUNNING', { timeout: 300000 });
      cy.reload();
      cy.get('[aria-label="List of Disks"]')
        .find('tr')
        .should('have.length', 3);
      deleteLinodeByLabel(linode.response?.body.label);
      deleteAllTestStackscripts();
    });
  });
});
