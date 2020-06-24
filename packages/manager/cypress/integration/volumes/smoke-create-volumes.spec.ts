import { makeVolumeLabel } from '../../support/api/volumes';
import { verify } from 'cypress/types/sinon';

describe('create volume', () => {
  it('creates a volume', () => {
    const title = makeVolumeLabel();

    cy.visitWithLogin('/volumes/create');
    cy.url().should('endWith', '/volumes/create');
    cy.findByText('volumes');
    // cy.get('[data-testid="link-text"]').should('have.text', 'volumes');
    // cy.get('[data-qa-header]').should('have.text', 'Create');
    cy.get('[data-qa-volume-label] [data-testid="textfield-input"]').type(
      title
    );
    cy.findByText('Regions')
      .click()
      .type('new {enter}');
    // cy.findByText('Create');
    cy.get('[data-qa-deploy-linode]').click();
    cy.findByText('Volume Configuration');
    cy.findByDisplayValue(`mkdir "/mnt/${title}"`);
    cy.contains('Close')
      .should('be.visible')
      .click();
  });
});
