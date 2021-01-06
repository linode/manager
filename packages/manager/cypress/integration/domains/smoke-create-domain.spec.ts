import {
  deleteAllTestDomains,
  makeDomainLabel
} from '../../support/api/domains';
import { testTag } from '../../support/api/common';
import { fbtClick, fbtVisible, getClick } from '../../support/helpers';

describe('Create a Domain', () => {
  before(deleteAllTestDomains);

  it('Creates first Domain', () => {
    // we stub this to ensure there is an empty state
    cy.intercept('GET', 'v4/domains*', req => {
      req.reply(res => {
        res.send({
          results: 0,
          page: 1,
          pages: 1,
          data: []
        });
      });
    }).as('getDomains');
    cy.intercept('POST', '*/domains').as('createDomain');
    cy.visitWithLogin('/domains');
    cy.wait('@getDomains');
    fbtClick('Add a Domain');
    fbtVisible('Create a Domain');
    // The findByLabel does not work for this select
    // cy.findByLabelText('Add Tags')
    cy.findByText('create a tag', { exact: false })
      .click()
      .type(`${testTag}{enter}`);
    const label = makeDomainLabel();
    cy.findByLabelText('Domain').type(label);
    cy.findByLabelText('SOA Email Address').type('devs@linode.com');
    getClick('[data-testid="create-domain-submit"]');
    cy.wait('@createDomain');
    cy.get('[data-qa-header]').should('contain', label);
  });
});
