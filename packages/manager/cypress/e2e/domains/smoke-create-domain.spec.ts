import {
  fbtClick,
  fbtVisible,
  getClick,
  getVisible,
} from '../../support/helpers';
import { randomDomainName } from 'support/util/random';

describe('Create a Domain', () => {
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
    const label = randomDomainName();
    getVisible('[id="domain"][data-testid="textfield-input"]').type(label);
    getVisible('[id="soa-email-address"][data-testid="textfield-input"]').type(
      'devs@linode.com'
    );
    getClick('[data-testid="create-domain-submit"]');
    cy.wait('@createDomain');
    cy.get('[data-qa-header]').should('contain', label);
  });
});
