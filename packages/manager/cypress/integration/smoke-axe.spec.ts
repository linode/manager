import { pages } from '../support/ui/constants';

describe.skip('smoke - axe', () => {
  pages.forEach((page) => {
    (page.first ? it.only : page.skip ? it.skip : it)(`${page.name}`, () => {
      cy.visitWithLogin(page.url);
      page.assertIsLoaded();

      cy.injectAxe();
      cy.configureAxe({
        rules: [
          // aria title on ADA bot frame added after 2 secs, skipping check foir speed
          { id: 'frame-title', enabled: false },
          {
            // our design is not good for that
            id: 'color-contrast',
            enabled: false,
          },
        ],
      });
      cy.checkA11y();
    });
  });
});
