import { makeVolumeLabel } from '../support/api/volumes';

describe('create volume', () => {
  it('creates a volume', () => {
    const title = makeVolumeLabel();

    cy.visitWithLogin('/volumes/create');
    cy.url().should('contain', '/volumes/create');
    cy.get('[data-testid="link-text"]').should('have.text', 'volumes');
    cy.get('[data-qa-header]').should('have.text', 'Create');
    cy.get('[data-qa-volume-label] [data-testid="textfield-input"]').type(
      title
    );
    cy.contains('Region')
      .click()
      .type('new {enter}');
    cy.get('[data-qa-deploy-linode]').click();
    cy.get('[data-qa-drawer-title]').should(
      'have.text',
      'Volume Configuration'
    );
    cy.get('[data-qa-mountpoint] input').should(
      'have.value',
      `mkdir "/mnt/${title}"`
    );
    cy.contains('Close')
      .should('be.visible')
      .click();
  });
});
