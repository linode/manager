import { fbtClick, fbtVisible, getClick, getVisible } from 'support/helpers';
import { randomLabel, randomString } from 'support/util/random';

const createLinode = () => {
  const password = randomString(32);
  fbtClick('Select a Region');
  fbtClick('Newark, NJ');
  fbtClick('Shared CPU');
  getClick('[id="g6-nanode-1"]');
  getClick('[id="root-password"]').type(password);
  getClick('[data-qa-deploy-linode]');
};

describe('stackscripts', () => {
  it('create stackscript, use it to deploy linode', () => {
    const disk = 'Alpine 3.15';
    cy.intercept('POST', `*/linode/instances`).as('createLinode');
    const ssLabel = randomLabel();
    cy.visitWithLogin('/stackscripts');
    cy.url().should('endWith', '/account');
    fbtVisible('Create StackScript').click();
    getClick('[id="stackscript-label"]').type(ssLabel);
    getClick('[data-qa-multi-select="Select an Image"]').type(
      `${disk} {enter}`
    );
    getClick('[data-qa-stackscript-script="true"]').type('#!/bin/bash');
    getClick('[data-qa-save="true"]');
    fbtVisible(ssLabel);
    getVisible(`[data-qa-table-row="${ssLabel}"]`);
    cy.get(`[aria-label="Action menu for StackScript ${ssLabel}"]`)
      .invoke('attr', 'aria-controls')
      .then(($id) => {
        if ($id) {
          getClick(`[aria-label="Action menu for StackScript ${ssLabel}"]`);
        }
        getClick(
          `[id="option-1--${$id}"][data-qa-action-menu-item="Deploy New Linode"]`
        );
      });

    createLinode();
    cy.wait('@createLinode', { timeout: 300000 }).then((linode) => {
      cy.visit(`/linodes/${linode.response?.body.id}/storage`);
      fbtVisible(linode.response?.body.label);
    });
  });
});
