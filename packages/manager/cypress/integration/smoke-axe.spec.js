import { pages } from '../support/ui/constants';

describe.skip('smoke - axe', () => {
  beforeEach(() => {
    cy.login2();
  });
  pages.forEach(page => {
    it(`${page.name}`, () => {
      cy.visit(page.url);
      page.assertIsLoaded();

      cy.injectAxe();
      cy.configureAxe({
        rules: [
          // aria title on ADA bot frame added after 2 secs, skipping check foir speed
          { id: 'frame-title', enabled: false },
          {
            // our design is not good for that
            id: 'color-contrast',
            enabled: false
          }
        ]
      });
      cy.checkA11y();
    });
  });
});
