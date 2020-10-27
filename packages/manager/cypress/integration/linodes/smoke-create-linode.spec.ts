import strings from '../../support/cypresshelpers';
import {
  makeLinodeLabel,
  deleteAllTestLinodes
} from '../../support/api/linodes';
import { assertToast } from '../../support/ui/events';
import { fbtClick } from '../../support/helpers';

describe('create linode', () => {
  beforeEach(() => {
    cy.visitWithLogin('/linodes/create');
    cy.get('[data-qa-deploy-linode]');
  });
  it('creates a nanode', () => {
    const rootpass = strings.randomPass();
    const linodeLabel = makeLinodeLabel();
    cy.server();
    cy.route({
      method: 'POST',
      url: '*/linode/instances'
    }).as('linodeCreated');
    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');
    cy.contains('Regions')
      .click()
      .type('new {enter}');
    fbtClick('Nanode 1GB');
    cy.get('#linode-label')
      .click()
      .clear()
      .type(linodeLabel);
    cy.get('#root-password').type(rootpass);
    cy.get('[data-qa-deploy-linode]').click();
    cy.wait('@linodeCreated')
      .its('status')
      .should('eq', 200);
    assertToast(`Your Linode ${linodeLabel} is being created.`);
    cy.contains('Provisioning').should('be.visible');
    deleteAllTestLinodes();
  });
});
