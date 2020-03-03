import strings from '../../support/cypresshelpers';
import {
  deleteLinodeByLabel,
  makeLinodeLabel
} from '../../support/api/linodes';
import { stubEvent } from '../../support/api/events';

import { checkToast } from '../../support/ui/events';

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
    cy.server();

    checkToast(`Your Linode ${linodeLabel} is being created.`);

    cy.get('[data-qa-power-control="Busy"]', { timeout: 6000 }).should(
      'be.visible'
    );

    deleteLinodeByLabel(linodeLabel);
  });
});
