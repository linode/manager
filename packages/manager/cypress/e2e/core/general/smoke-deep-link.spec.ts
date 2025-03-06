import { pages } from 'support/ui/constants';

import type { Page } from 'support/ui/constants';

beforeEach(() => {
  cy.tag('method:e2e');
});
describe('smoke - deep links', () => {
  beforeEach(() => {
    cy.visitWithLogin('/null');
  });

  it('Go to each route and validate deep links', () => {
    pages.forEach((page: Page) => {
      cy.log(`Go to ${page.name}`);
      page.goWithUI?.forEach((uiPath) => {
        cy.log(`by ${uiPath.name}`);
        expect(uiPath.name).not.to.be.empty;
        uiPath.go();
        cy.url().should('be.eq', `${Cypress.config('baseUrl')}${page.url}`);
      });
    });
  });
});
