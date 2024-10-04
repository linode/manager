import { getAllRoutePaths } from 'src/routes/utils/allPaths';
import { migrationRouteTree } from 'src/routes';

const allPaths = getAllRoutePaths(migrationRouteTree);

console.log({ allPaths });

beforeEach(() => {
  cy.tag('method:e2e');
});

describe.skip('smoke - deep links', () => {
  before(() => {
    cy.visitWithLogin('/');
  });

  it('Go to each route and validate deep links', () => {
    allPaths.forEach((page) => {
      cy.log(`Go to ${page}`);
      cy.visit(page);

      // Assert that the router wrapper is present
      cy.get('[data-qa-migration-router]').should('exist');

      // Assert that the NotFound component is not present
      cy.get('[data-qa-not-found]').should('not.exist');

      // Assert that there's a heading (assuming each valid page has a heading)
      cy.findByRole('heading', { level: 1 }).should('exist');

      cy.get('[role="contentinfo"]').should('exist');
    });
  });
});
