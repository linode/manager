import type { Context } from 'mocha';

/**
 * Skips the running test.
 */
export const skip = () => {
  // `cy.state()` is intended to be used by Cypress internally, and the API
  // is not guaranteed to be stable.
  //
  // Implementation taken from `cypress-skip-test`:
  // https://github.com/cypress-io/cypress-skip-test
  //
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore "cy.state" is not in the "cy" type
  const mochaContext = cy.state('runnable').ctx as Context;
  return mochaContext.skip();
};
