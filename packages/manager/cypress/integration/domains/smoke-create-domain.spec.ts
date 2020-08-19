import {
  deleteAllTestDomains,
  makeDomainLabel
} from '../../support/api/domains'

describe('Create a Domain', () => {
  before(deleteAllTestDomains);

  it('Creates a Domain', () => {
    cy.visitWithLogin('/domains');
    cy.url().should('contain', '/domains');
    cy.contains('Create a Domain...').click();
    cy.get('[data-testid="drawer"]').should('contain', 'Add a new Domain');
    const label = makeDomainLabel();
    cy.get(
      '[data-testid="domain-name-input"] [data-testid="textfield-input"]'
    ).type(label);
    cy.get('[data-testid="soa-email-input"]').type('devs@linode.com');
    cy.get('[data-testid="create-domain-submit"]').click();
    cy.get('[data-qa-header').should('contain', label);
  });
});
