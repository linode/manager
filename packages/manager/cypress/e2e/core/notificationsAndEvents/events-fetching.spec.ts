/**
 * @file Integration tests for Cloud Manager's events fetching and polling behavior.
 */

import { mockGetEvents } from 'support/intercepts/events';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { DateTime } from 'luxon';
import { eventFactory } from 'src/factories';
import { randomNumber } from 'support/util/random';
import { Interception } from 'cypress/types/net-stubbing';

const testParameters = [
  {
    // Run the tests against legacy notifications menu implementation.
    // Mock the `eventMessagesV2` flag to be `false`.
    label: 'Notifications Menu v1',
    hook: () => {
      mockAppendFeatureFlags({
        eventMessagesV2: false,
      });
    },
  },
  {
    // Run the tests against the new notifications menu implementation.
    // Mock the `eventMessagesV2` flag to be `true`.
    label: 'Notifications Menu v2',
    hook: () => {
      mockAppendFeatureFlags({
        eventMessagesV2: true,
      });
    },
  },
];

describe('Event fetching and polling', () => {
  testParameters.forEach((parameter) => {
    describe(parameter.label, () => {
      // Set up feature flags according to parameterized environment.
      beforeEach(() => {
        parameter.hook();
      });

      /**
       * - Confirms that Cloud Manager makes a request to the events endpoint on page load.
       * - Confirms API filters are applied to the request to limit the number and type of events retrieved.
       */
      it('Makes initial fetch to events endpoint', () => {
        mockGetEvents([]).as('getEvents');
        cy.visitWithLogin('/');
        cy.wait('@getEvents').then((xhr) => {
          const filters = xhr.request.headers['x-filter'];
          const lastWeekTimestamp = DateTime.now()
            .minus({ weeks: 1 })
            .toISODate();

          /*
           * Confirm that initial fetch request contains filters to achieve
           * each of the following behaviors:
           *
           * - Exclude `profile_update` events.
           * - Retrieve a maximum of 25 events.
           * - Sort events by their created date.
           * - Only retrieve events created within the past week.
           */
          expect(filters).to.contain('"+neq":"profile_update"');
          //expect(filters).to.contain('"+limit":25');
          //expect(filters).to.contain('"+order_by":"created"');
          expect(filters).to.contain('"+order_by":"id"');
          expect(filters).to.contain(`"created":{"+gt":"${lastWeekTimestamp}`);
        });
      });

      /**
       * - Confirms that Cloud Manager makes subsequent events requests after the initial request.
       * - Confirms API filters are applied to polling requests which differ from the initial request.
       */
      it('Polls events endpoint after initial fetch', () => {
        const mockEvent = eventFactory.build({
          id: randomNumber(10000, 99999),
          created: DateTime.now().minus({ minutes: 5 }).toISO(),
          duration: null,
          rate: null,
          percent_complete: null,
        });

        mockGetEvents([mockEvent]).as('getEvents');
        cy.visitWithLogin('/');

        cy.wait(['@getEvents', '@getEvents']);
        cy.get('@getEvents.all').then((xhrRequests: unknown) => {
          // Cypress types for `cy.get().then(...)` seem to be wrong.
          // Types suggest that `cy.get()` can only yield a jQuery HTML element, but
          // when the alias is an HTTP route it yields the request and response data.
          const secondRequest = (xhrRequests as Interception<any, any>[])[1];
          const filters = secondRequest.request.headers['x-filter'];

          /*
           * Confirm that polling fetch request contains filters to achieve
           * each of the following behaviors:
           *
           * - Exclude `profile_update` events.
           * - Only retrieve events created more recently than the most recent event in the initial fetch.
           * - Exclude the most recent event that was included in the initial fetch.
           * - Sort events by their ID (TODO).
           */
          expect(filters).to.contain('"action":{"+neq":"profile_update"}');
          expect(filters).to.contain(
            `"created":{"+gte":"${mockEvent.created}"}`
          );
          expect(filters).to.contain(`{"id":{"+neq":${mockEvent.id}}}]`);
          expect(filters).to.contain('"+order_by":"id"');
        });
      });

      /**
       * - Confirms that Cloud Manager polls the events endpoint 16 times per second.
       * - Confirms that Cloud Manager makes a request to the events endpoint after 16 seconds.
       * - Confirms that Cloud Manager does not make a request to the events endpoint before 16 seconds have passed.
       * - Confirms Cloud polling rate when there are no in-progress events.
       */
      it('Polls events at a 16-second interval', () => {
        // Expect Cloud to poll the events endpoint every 16 seconds,
        // and configure the test to check if a request has been made
        // every simulated second for 16 samples total.
        const expectedPollingInterval = 16_000;
        const pollingSamples = 16;

        const mockEvent = eventFactory.build({
          id: randomNumber(10000, 99999),
          created: DateTime.now().minus({ minutes: 5 }).toISO(),
          duration: null,
          rate: null,
          percent_complete: null,
        });

        // Visit Cloud Manager, and wait for Cloud to fire its first two
        // requests to the `events` endpoint: the initial request, and the
        // initial polling request.
        mockGetEvents([mockEvent]).as('getEventsInitialFetches');
        cy.clock();
        cy.visitWithLogin('/');
        cy.tick(10000);

        // Wait for Cloud to make its initial 2 requests to the events endpoint
        // before we begin monitoring polling intervals.
        cy.wait(['@getEventsInitialFetches', '@getEventsInitialFetches']);

        // Set up intercept and mock for subsequent events requests.
        mockGetEvents([mockEvent]).as('getEventsPoll');

        // Simulate a time lapse of 16 seconds, asserting that no request
        // has been made to the events endpoint during the interim.
        for (let i = 0; i < pollingSamples; i += 1) {
          cy.log(
            `Confirming that Cloud has not made events request... (${
              i + 1
            }/${pollingSamples})`
          );
          cy.get('@getEventsPoll.all').should('have.length', 0);
          cy.tick(expectedPollingInterval / pollingSamples, { log: false });

          // Give Cloud Manager a chance to fire a request by waiting 50ms.
          // Without this wait, we can get false positives because Cypress won't
          // recognize the request to the events endpoint even if Cloud fires one.
          // Adding this call to `cy.wait` ensures that Cypress intercepts any
          // outgoing events requests that might be made erroneously.
          cy.wait(50, { log: false });
        }

        // Confirm that Cloud makes expected polling request now that expected
        // interval has passed.
        cy.wait('@getEventsPoll');
        cy.get('@getEventsPoll.all').should('have.length', 1);
      });

      /**
       * - Confirms that Cloud Manager polls the events endpoint 2 times per second when there are in-progress events.
       * - Confirms that Cloud Manager makes a request to the events endpoint after 2 seconds.
       * - Confirms that Cloud Manager does not make a request to the events endpoint before 2 seconds have passed.
       * - Confirms Cloud polling rate when there are in-progress events.
       */
      it('Polls in-progress events at a 2-second interval', () => {
        // When in-progress events are present, expect Cloud to poll the
        // events endpoint every 2 seconds, and configure the test to check
        // if a request has been made every simulated tenth of a second for
        // 20 samples total.
        const expectedPollingInterval = 2_000;
        const pollingSamples = 20;

        const mockEventBasic = eventFactory.build({
          id: randomNumber(10000, 99999),
          created: DateTime.now().minus({ minutes: 5 }).toISO(),
          duration: null,
          rate: null,
          percent_complete: null,
        });

        const mockEventInProgress = eventFactory.build({
          id: randomNumber(10000, 99999),
          created: DateTime.now().minus({ minutes: 6 }).toISO(),
          duration: 0,
          rate: null,
          percent_complete: 50,
        });

        const mockEvents = [mockEventBasic, mockEventInProgress];

        // Visit Cloud Manager, and wait for Cloud to fire its first two
        // requests to the `events` endpoint: the initial request, and the
        // initial polling request.
        mockGetEvents(mockEvents).as('getEventsInitialFetches');
        cy.clock();
        cy.visitWithLogin('/');
        cy.tick(10000);

        // Wait for Cloud to make its initial 2 requests to the events endpoint
        // before we begin monitoring polling intervals.
        cy.wait(['@getEventsInitialFetches', '@getEventsInitialFetches']);

        mockGetEvents(mockEvents).as('getEventsPoll');

        // Simulate a time lapse of 16 seconds, asserting that no request
        // has been made to the events endpoint during the interim.
        for (let i = 0; i < pollingSamples; i += 1) {
          cy.log(
            `Confirming that Cloud has not made events request... (${
              i + 1
            }/${pollingSamples})`
          );
          cy.get('@getEventsPoll.all').should('have.length', 0);
          cy.tick(expectedPollingInterval / pollingSamples, { log: false });

          // Give Cloud Manager a chance to fire a request by waiting 50ms.
          // Without this wait, we can get false positives because Cypress won't
          // recognize the request to the events endpoint even if Cloud fires one.
          // Adding this call to `cy.wait` ensures that Cypress intercepts any
          // outgoing events requests that might be made erroneously.
          cy.wait(50, { log: false });
        }

        // Confirm that Cloud makes expected polling request now that expected
        // interval has passed.
        cy.wait('@getEventsPoll');
        cy.get('@getEventsPoll.all').should('have.length', 1);
      });
    });
  });
});
