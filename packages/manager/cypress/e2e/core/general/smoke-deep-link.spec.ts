import { pages } from 'support/ui/constants';

import type { Page } from 'support/ui/constants';

describe('smoke - deep link', () => {
  pages.forEach((page: Page) => {
    describe(`Go to ${page.name}`, () => {
      // check if we run only one test
      if (!page.goWithUI) {
        return;
      }

      // Here we use login to /null here
      // so this is independant from what is coded in constants and which path are skipped
      beforeEach(() => {
        cy.visitWithLogin('/null');
      });

      page.goWithUI.forEach((uiPath) => {
        (page.first ? it.only : page.skip ? it.skip : it)(
          `by ${uiPath.name}`,
          () => {
            expect(uiPath.name).not.to.be.empty;
            uiPath.go();
            cy.url().should('be.eq', `${Cypress.config('baseUrl')}${page.url}`);
          }
        );
      });
    });
  });
});
