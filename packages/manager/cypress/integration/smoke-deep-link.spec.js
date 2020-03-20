import { pages } from '../support/ui/constants';

describe('smoke - deep link', () => {
  pages.forEach(page => {
    if (!page.goWithUI) {
      return;
    }
    describe(`Got to ${page.name}`, () => {
      beforeEach(() => {
        cy.login2();
      });
      page.goWithUI.forEach(uiPath => {
        it(`by ${uiPath.name}`, () => {
          uiPath.go();
          cy.url().should('be.eq', `${Cypress.config('baseUrl')}${page.url}`);
        });
      });
    });
  });
});
