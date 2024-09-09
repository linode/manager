/**
 * @file Utilities related to accessibility testing.
 */

/**
 * Performs automated Axe accessibility checks against a component.
 *
 * Only applicable to component tests; does not achieve anything when used
 * by an integration test.
 *
 * @param rulesetTag - Axe ruleset tag. Defaults to WCAG 2.2 Level AA rules.
 *
 * @link [axe-core rule tags](https://www.deque.com/axe/core-documentation/api-documentation/#axecore-tags)
 */
export const checkComponentA11y = (rulesetTag: string = 'wcag22aa') => {
  // Specify a custom aXe core path to account for monorepo package layout.
  const axeCorePath = '../../node_modules/axe-core/axe.min.js';

  // Perform checks against component only and not the surrounding HTML.
  const componentContext = '[data-cy-root]';

  cy.injectAxe({ axeCorePath });
  cy.checkA11y(componentContext, {
    runOnly: {
      type: 'tag',
      values: [rulesetTag],
    },
  });
};
