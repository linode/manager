import {
  deleteAllTestDomains,
  makeDomainLabel,
} from '../../support/api/domains';
import { fbtClick, fbtVisible, getClick } from '../../support/helpers';

describe('Create a Domain', () => {
  before(deleteAllTestDomains);

  it('Creates first Domain', () => {
    // modify incoming response
    cy.intercept('GET', 'v4/domains*', (req) => {
      req.reply((res) => {
        res.send({
          results: 0,
          page: 1,
          pages: 1,
          data: [],
        });
      });
    }).as('getDomains');
    // intercept create Domain request
    cy.intercept('POST', '*/domains').as('createDomain');
    cy.visitWithLogin('/domains');
    cy.wait('@getDomains');
    fbtClick('Create Domain');
    const label = makeDomainLabel();
    fbtVisible('Domain (required)').type(label);
    fbtVisible('SOA Email Address (required)').type('devs@linode.com');
    getClick('[data-testid="create-domain-submit"]');
    cy.wait('@createDomain');
    cy.get('[data-qa-header]').should('contain', label);
  });
});
