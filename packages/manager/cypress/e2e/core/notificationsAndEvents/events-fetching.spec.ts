/**
 * @file Integration tests for Cloud Manager's events fetching and polling behavior.
 */

import { mockGetEvents, mockGetEventsPolling } from 'support/intercepts/events';
import { DateTime } from 'luxon';
import { eventFactory } from 'src/factories';
import { randomNumber } from 'support/util/random';
import { mockGetVolumes } from 'support/intercepts/volumes';
import type { Interception } from 'support/cypress-exports';

describe('Event fetching and polling', () => {
  /**
   * - Confirms that Cloud Manager makes a request to the events endpoint on page load.
   * - Confirms API filters are applied to the request to limit the number and type of events retrieved.
   */
  it('Makes initial fetch to events endpoint', () => {
    const mockNow = DateTime.now();

    mockGetEvents([]).as('getEvents');

    cy.clock(mockNow.toJSDate());
    cy.visitWithLogin('/');
    cy.wait('@getEvents').then((xhr) => {
      const filters = xhr.request.headers['x-filter'];
      const lastWeekTimestamp = mockNow
        .minus({ weeks: 1 })
        .toUTC()
        .startOf('second') // Helps with matching the timestamp at the start of the second
        .toFormat("yyyy-MM-dd'T'HH:mm:ss");

      const timestampFilter = `"created":{"+gt":"${lastWeekTimestamp}"`;

      /*
       * Confirm that initial fetch request contains filters to achieve
       * each of the following behaviors:
       *
       * - Exclude `profile_update` events.
       * - Retrieve a maximum of 25 events.
       * - Sort events by their created date.
       * - Only retrieve events created within the past week.
       */
      expect(filters).to.contain(timestampFilter);
      expect(filters).to.contain('"+neq":"profile_update"');
      expect(filters).to.contain('"+order_by":"id"');
    });
  });

  /**
   * - Confirms that Cloud Manager makes subsequent events requests after the initial request.
   * - Confirms API filters are applied to polling requests which differ from the initial request.
   */
  it('Polls events endpoint after initial fetch', () => {
    const mockEvent = eventFactory.build({
      id: randomNumber(10000, 99999),
      created: DateTime.now()
        .minus({ minutes: 5 })
        .toUTC()
        .startOf('second') // Helps with matching the timestamp at the start of the second
        .toFormat("yyyy-MM-dd'T'HH:mm:ss"),
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
      expect(filters).to.contain(`"created":{"+gte":"${mockEvent.created}"}`);
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
    const mockNow = DateTime.now();
    const mockNowTimestamp = mockNow
      .toUTC()
      .startOf('second') // Helps with matching the timestamp at the start of the second
      .toFormat("yyyy-MM-dd'T'HH:mm:ss");

    const mockEvent = eventFactory.build({
      id: randomNumber(10000, 99999),
      created: DateTime.now()
        .minus({ minutes: 5 })
        .toFormat("yyyy-MM-dd'T'HH:mm:ss"),
      duration: null,
      rate: null,
      percent_complete: null,
    });

    mockGetEvents([mockEvent]).as('getEventsInitialFetches');

    // We need access to the `clock` object directly since we cannot call `cy.clock()` inside
    // a `should(() => {})` callback because Cypress commands are disallowed there.
    cy.clock(mockNow.toJSDate()).then((clock) => {
      cy.visitWithLogin('/');

      // Confirm that Cloud manager polls the requests endpoint no more than
      // once every 16 seconds.
      mockGetEventsPolling([mockEvent], mockNowTimestamp).as('getEventsPoll');
      for (let i = 0; i < pollingSamples; i += 1) {
        cy.log(
          `Confirming that Cloud has not made events request... (${
            i + 1
          }/${pollingSamples})`
        );
        cy.get('@getEventsPoll.all').should('have.length', 0);
        cy.tick(expectedPollingInterval / pollingSamples, { log: false });
      }

      cy.tick(50);
      cy.wait('@getEventsPoll');
      cy.get('@getEventsPoll.all').should('have.length', 1);
    });
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
    const mockNow = DateTime.now();
    const mockNowTimestamp = mockNow
      .toUTC()
      .startOf('second') // Helps with matching the timestamp at the start of the second
      .toFormat("yyyy-MM-dd'T'HH:mm:ss");

    const mockEventBasic = eventFactory.build({
      id: randomNumber(10000, 99999),
      created: DateTime.now()
        .minus({ minutes: 5 })
        .startOf('second') // Helps with matching the timestamp at the start of the second
        .toFormat("yyyy-MM-dd'T'HH:mm:ss"),
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

    // We need access to the `clock` object directly since we cannot call `cy.clock()` inside
    // a `should(() => {})` callback because Cypress commands are disallowed there.
    cy.clock(Date.now()).then((clock) => {
      cy.visitWithLogin('/');

      // Confirm that Cloud manager polls the requests endpoint no more than once
      // every 2 seconds.
      mockGetEventsPolling(mockEvents, mockNowTimestamp).as('getEventsPoll');
      for (let i = 0; i < pollingSamples; i += 1) {
        cy.log(
          `Confirming that Cloud has not made events request... (${
            i + 1
          }/${pollingSamples})`
        );
        cy.get('@getEventsPoll.all').should('have.length', 0);
        cy.tick(expectedPollingInterval / pollingSamples, { log: false });
      }

      cy.tick(50);
      cy.wait('@getEventsPoll');
      cy.get('@getEventsPoll.all').should('have.length', 1);
    });
  });
});

describe('Event Handlers', () => {
  it('invokes event handlers when new events are polled and makes the correct number of requests', () => {
    // See https://github.com/linode/manager/pull/10824

    mockGetEvents([]).as('getEvents');
    mockGetVolumes([]).as('getInitialVolumes');

    cy.visitWithLogin('/volumes');

    // Wait for the initial events fetch and initial volumes fetch
    cy.wait(['@getEvents', '@getInitialVolumes']);

    // Wait for the first polling interval to happen
    cy.wait('@getEvents');

    const polledEvents = [
      eventFactory.build({ action: 'volume_update', status: 'notification' }),
      eventFactory.build({ action: 'volume_update', status: 'notification' }),
      eventFactory.build({ action: 'volume_update', status: 'notification' }),
    ];

    // Pretend a volume was updated 3 times in a row
    mockGetEvents(polledEvents).as('getEvents');

    // Intercept GET volumes so we can later check how many times it is fetched
    mockGetVolumes([]).as('getVolumes');

    // Wait for volume update events to be polled
    cy.wait('@getEvents');

    // On the next interval, mock no new events
    mockGetEvents([]).as('getEvents');
    cy.wait('@getEvents');

    // Finally, verify the volume endpoint was only fetched once
    cy.get('@getVolumes.all').should('have.length', 1);
  });
});
