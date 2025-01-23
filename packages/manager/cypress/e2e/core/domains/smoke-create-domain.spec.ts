import { Domain } from '@linode/api-v4';
import { domainFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { fbtClick, getClick, getVisible } from 'support/helpers';
import {
  interceptCreateDomain,
  mockGetDomains,
} from 'support/intercepts/domains';
import { cleanUp } from 'support/util/cleanup';
import { randomDomainName } from 'support/util/random';

authenticate();
describe('Create a Domain', () => {
  before(() => {
    cleanUp('domains');
  });

  it('Creates first Domain', () => {
    cy.tag('method:e2e');
    // Mock Domains to modify incoming response.
    const mockDomains = new Array(2).fill(null).map(
      (_item: null, index: number): Domain => {
        return domainFactory.build({
          domain: `Domain ${index}`,
        });
      }
    );
    mockGetDomains(mockDomains).as('getDomains');
    // intercept create Domain request
    interceptCreateDomain().as('createDomain');
    cy.visitWithLogin('/domains');
    cy.wait('@getDomains');
    fbtClick('Create Domain');
    const label = randomDomainName();
    getVisible('[id="domain"][data-testid="textfield-input"]').type(label);
    getVisible('[id="soa-email-address"][data-testid="textfield-input"]').type(
      'devs@linode.com'
    );
    getClick('[data-testid="submit"]');
    cy.wait('@createDomain');
    cy.get('[data-qa-header]').should('contain', label);
  });
});
