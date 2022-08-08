/**
 * @file Tracks the number of Linode APIv4 requests being made during each test.
 */

// The number of Linode APIvr requests that are allowed.
// Set to `null` to allow any number of APIv4 requests.
const maxRequests: number | null = null;

// Whether a test should fail immediately upon passing `maxRequests` threshold.
// If `false`, the test will continue running but will fail upon finishing.
const failImmediately = false;

// Whether or not to report the APIv4 request count at the end of a test.
const reportRequestCount = true;

const makeErrorString = (requests: number, max: number) => {
  return `Excessive Linode APIv4 requests were detected, causing this test to fail.\n\nAPIv4 requests: ${requests}\nMaximum requests: ${max}`;
};

// Set up Linode APIv4 intercepts and set default alias value.
beforeEach(() => {
  let requests = 0;

  cy.wrap([]).as('linodeApiV4Request');
  cy.intercept(
    {
      url: /\/v4(?:beta)?\/.*/,
      middleware: true,
    },
    (req) => {
      requests++;
      // Short-circuit if `maxRequests` is null.
      if (maxRequests === null) {
        return;
      }

      // Fail test if API threshold is met and `failImmediately` is true.
      if (requests > maxRequests && failImmediately) {
        throw new Error(makeErrorString(requests, maxRequests));
      }
    }
  ).as('linodeApiV4Request');
});

// Tally and report intercepted Linode APIv4 requests, failing test if necessary.
afterEach(() => {
  cy.get('@linodeApiV4Request.all').then((calls) => {
    const count = calls.length;
    if (reportRequestCount) {
      cy.log(`${count} Linode APIv4 requests were made during this test`);
    }
    if (maxRequests !== null && count > maxRequests) {
      throw new Error(makeErrorString(count, maxRequests));
    }
  });
});
