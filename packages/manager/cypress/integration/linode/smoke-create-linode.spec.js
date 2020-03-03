import strings from '../../support/cypresshelpers';
import '@testing-library/cypress/add-commands';

import {deleteLinodeByLabel, makeLinodeLabel} from '../../support/api/linodes';

describe('create linode', () => {
  beforeEach(() => {
    cy.login2();
  });
  it('creates a nanode', () => {
    const rootpass = strings.randomPass();
    const linodeLabel = makeLinodeLabel();
    cy.visit('/linodes/create');
    cy.get('[data-testid="link-text"]').should('have.text', 'linodes');
    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');
    cy.contains('Regions')
      .click()
      .type('new {enter}');
    cy.contains('Nanode').click();
    cy.get('[data-qa-plan-row="Nanode 1GB"]').click();
    cy.get('#linode-label')
      .click()
      .clear()
      .type(linodeLabel);
    cy.get('#root-password').type(rootpass);
    cy.get('[data-qa-deploy-linode]').click();
    cy.get('[data-qa-power-control="Busy"]').should('be.visible');
    deleteLinodeByLabel(linodeLabel);
  });
});
