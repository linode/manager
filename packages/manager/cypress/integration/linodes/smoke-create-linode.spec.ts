import strings from '../../support/cypresshelpers';
import {
  deleteLinodeByLabel,
  makeLinodeLabel
} from '../../support/api/linodes';
import { assertToast } from '../../support/ui/events';

describe('create linode', () => {
  beforeEach(() => {
    cy.visitWithLogin('/linodes/create');
    cy.get('[data-qa-deploy-linode]');
  });
  it('creates a nanode', () => {
    const rootpass = strings.randomPass();
    const linodeLabel = makeLinodeLabel();
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

    assertToast(`Your Linode ${linodeLabel} is being created.`);
    cy.get('[data-qa-power-control="Busy"]', { timeout: 6000 }).should(
      'be.visible'
    );

    deleteLinodeByLabel(linodeLabel);
  });
});
