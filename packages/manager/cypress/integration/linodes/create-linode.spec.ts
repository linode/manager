import { assertToast } from 'support/ui/events';
import {
  containsClick,
  containsVisible,
  fbtClick,
  fbtVisible,
  getClick,
} from 'support/helpers';
import { selectRegionString } from 'support/ui/constants';
import { randomString, randomLabel } from 'support/util/random';

describe('create linode', () => {
  it('creates a nanode', () => {
    const rootpass = randomString(32);
    const linodeLabel = randomLabel();
    // intercept request
    cy.visitWithLogin('/linodes/create');
    cy.get('[data-qa-deploy-linode]');
    cy.intercept('POST', '*/linode/instances').as('linodeCreated');
    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');
    containsClick(selectRegionString).type('new {enter}');
    fbtClick('Shared CPU');
    getClick('[id="g6-nanode-1"]');
    getClick('#linode-label').clear().type(linodeLabel);
    cy.get('#root-password').type(rootpass);
    getClick('[data-qa-deploy-linode]');
    cy.wait('@linodeCreated').its('response.statusCode').should('eq', 200);
    assertToast(`Your Linode ${linodeLabel} is being created.`);
    containsVisible('PROVISIONING');
    fbtVisible(linodeLabel);
    cy.contains('RUNNING', { timeout: 300000 }).should('be.visible');
  });
});
