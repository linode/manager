import { Event } from '@linode/api-v4';
import { apiMatcher } from 'support/util/intercepts';
import { getFilters } from 'support/util/request';

export const mockInitialEventsRequest = () => {
  const cachedEvents = Cypress.env('cloudManagerInitialEvents') as
    | Event[]
    | undefined;

  // Short-circuit with a warning if no cached events data is available.
  // In practice, this should be impossible: if the request to fetch the events
  // data fails, Cypress will exit without running any tests.
  if (!cachedEvents) {
    console.warn('No cached events data is available');
    return;
  }

  beforeEach(() => {
    cy.intercept(
      {
        // middleware: true,
        url: apiMatcher('account/events*'),
      },
      (req) => {
        // Only mock the response if this is the initial fetch from Cloud Manager.
        const filters = getFilters(req);

        // Only our polling events requests have the '+and' filter at the top level,
        // so we can use its existence to determine whether the intercepted request
        // is for the initial fetch or subsequent polling fetches.
        if (filters?.['+and']) {
          req.continue();
          return;
        }

        req.reply(cachedEvents);
      }
    );
  });
};
