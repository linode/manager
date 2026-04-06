/**
 * @file Cypress `routeHandler` that responds to API requests with a sequence of stubbed responses.
 */

import type { CyHttpMessages } from 'support/cypress-exports';

/**
 * Returns a `routeHandler` function that replies with a sequence of stubbed responses.
 *
 * When an API request is intercepted, the first item in the `stubs` array is used as a response.
 * The next time the request is intercepted, the second item in the `stubs` array is used, and so
 * on.
 *
 * If the number of intercepted requests exceeds the number of items in the `stubs` array,
 * the last item in the `stubs` array will be used for all subsequent requests.
 *
 * See also:
 * - {@link https://docs.cypress.io/api/commands/intercept Cypress Intercept documentation}
 * - {@link https://docs.cypress.io/api/commands/intercept#routeHandler-lt-code-gtFunctionlt-code-gt Cypress `routeHandler` documentation}
 *
 * @param stubs - Stubbed response or array of stubbed responses.
 *
 * @throws {Error} `stubs` must be an object or an array of objects containing at least 1 item.
 *
 * @returns Cypress `routeHandler` function for sequential stubs.
 */
export const sequentialStub = function (stubs: any | any[]) {
  const stubData = Array.isArray(stubs) ? stubs : [stubs];
  let count = 0;

  if (!stubData.length) {
    throw new Error('Expected stubs array to contain at least 1 item');
  }

  return function (req: CyHttpMessages.IncomingHttpRequest) {
    const current = count;
    count++;

    if (current >= stubData.length) {
      req.reply(stubData[stubData.length - 1]);
    } else {
      req.reply(stubData[current]);
    }
  };
};
