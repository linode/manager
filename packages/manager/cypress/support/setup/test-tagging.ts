/* eslint-disable sonarjs/no-skipped-tests */
/**
 * @file Exposes the `tag` util from the `cy` object.
 */

import { addTag, tag } from 'support/util/tag';
import { evaluateQuery } from 'support/util/tag';

import type { Runnable, Test } from 'mocha';

// Expose tag utils from the `cy` object.
// Similar to `cy.state`, and unlike other functions exposed in `cy`, these do not
// queue Cypress commands. Instead, they modify the test tag map upon execution.
cy.tag = tag;
cy.addTag = addTag;

const query = Cypress.env('CY_TEST_TAGS') ?? '';

/**
 *
 */
Cypress.on('test:before:run', (_test: Test, _runnable: Runnable) => {
  /*
   * Looks for the first command that does not belong in a hook and evaluates tags.
   *
   * Waiting for the first command to begin executing ensures that test context
   * is set up and that tags have been assigned to the test.
   */
  const commandHandler = () => {
    const context = cy.state('ctx');
    if (context && context.test?.type !== 'hook') {
      const tags = context?.tags ? [...context.tags] : [];

      // Remove tags from context now that we've read them and can evaluate them.
      // This prevents tags from persisting between tests in certain situations.
      if (tags.length) {
        context.tags = [];
      }

      if (!evaluateQuery(query, tags)) {
        context.skip();
      }

      Cypress.removeListener('command:start', commandHandler);
    }
  };

  Cypress.on('command:start', commandHandler);
});
