import {
  deleteAllTestDomains,
  makeDomainLabel
} from '../../support/api/domains';
import { testTag } from '../../support/api/common';

describe('Create a Domain', () => {
  before(deleteAllTestDomains);

  it('Creates first Domain', () => {
    cy.server();
    // we stub this to ensure there is an empty state
    cy.route({
      method: 'GET',
      url: 'v4/domains*',
      response: {
        results: 0,
        page: 1,
        pages: 1,
        data: []
      }
    }).as(`getDomains`);
    cy.visitWithLogin('/domains');
    cy.wait('@getDomains');
    cy.url().should('endWith', '/domains');
    cy.findByText('Add a Domain').click();
    cy.findByText('Create a Domain');
    // The findByLabel does not work for this select
    // cy.findByLabelText('Add Tags')
    cy.findByText('create a tag', { exact: false })
      .click()
      .type(`${testTag}{enter}`);
    const label = makeDomainLabel();
    cy.findByLabelText('Domain').type(label);
    cy.findByLabelText('SOA Email Address').type('devs@linode.com');
    cy.findByText('Create').click();
    cy.get('[data-qa-header]').should('contain', label);
  });
});
