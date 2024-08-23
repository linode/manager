import { eventFactory } from 'src/factories';
import { mockGetEvents } from 'support/intercepts/events';
import { mockGetVolumes } from 'support/intercepts/volumes';

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
