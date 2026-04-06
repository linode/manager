import { domainFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import {
  interceptCreateDomain,
  mockGetDomains,
} from 'support/intercepts/domains';
import { cleanUp } from 'support/util/cleanup';
import { randomDomainName } from 'support/util/random';

import type { Domain } from '@linode/api-v4';

authenticate();
describe('Create a Domain', () => {
  before(() => {
    cleanUp('domains');
  });

  it('Creates first Domain', () => {
    cy.tag('method:e2e');
    // Mock Domains to modify incoming response.
    const mockDomains = new Array(2)
      .fill(null)
      .map((_item: null, index: number): Domain => {
        return domainFactory.build({
          domain: `Domain ${index}`,
        });
      });
    mockGetDomains(mockDomains).as('getDomains');
    // intercept create Domain request
    interceptCreateDomain().as('createDomain');
    cy.visitWithLogin('/domains');
    cy.wait('@getDomains');
    cy.findByText('Create Domain').click();
    const label = randomDomainName();
    cy.get('[id="domain"][data-testid="textfield-input"]')
      .should('be.visible')
      .type(label);
    cy.get('[id="soa-email-address"][data-testid="textfield-input"]')
      .should('be.visible')
      .type('devs@linode.com');
    cy.get('[data-testid="submit"]').click();
    cy.wait('@createDomain');
    cy.get('[data-qa-header]').should('contain', label);
  });
});
