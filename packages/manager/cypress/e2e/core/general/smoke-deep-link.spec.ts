import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { pages } from 'support/ui/constants';

import type { Page } from 'support/ui/constants';

beforeEach(() => {
  cy.tag('method:e2e');
});
describe('smoke - deep links', () => {
  beforeEach(() => {
    cy.visitWithLogin('/null');
    // Mock the iamRbacPrimaryNavChanges feature flag to be disabled.
    mockAppendFeatureFlags({
      iamRbacPrimaryNavChanges: false,
    }).as('getFeatureFlags');
  });

  it('Go to each route and validate deep links', () => {
    pages.forEach((page: Page) => {
      cy.log(`Go to ${page.name}`);
      page.goWithUI?.forEach((uiPath) => {
        cy.log(`by ${uiPath.name}`);
        cy.findByText(uiPath.name).should('not.be.empty');
        uiPath.go();
        cy.url().should('be.eq', `${Cypress.config('baseUrl')}${page.url}`);
      });
    });
  });
});
