import { pages } from '../support/ui/constants';

describe('smoke - deep link', () => {
  // check if we run oinly one test

  pages.forEach((page) => {
    if (!page.goWithUI) {
      return;
    }
    describe(`Go to ${page.name}`, () => {
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
