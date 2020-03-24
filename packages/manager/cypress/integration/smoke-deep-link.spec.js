import { pages } from '../support/ui/constants';

describe('smoke - deep link', () => {
  //check if we run oinly one test

  pages.forEach(page => {
    if (!page.goWithUI) {
      return;
    }
    describe(`Got to ${page.name}`, () => {
      beforeEach(() => {
        cy.login2();
      });

      page.goWithUI.forEach(uiPath => {
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
