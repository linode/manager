/**
 * @file Integration tests for Cloud Manager's events menu.
 */

import { mockGetEvents, mockMarkEventSeen } from 'support/intercepts/events';
import { ui } from 'support/ui';
import { eventFactory } from 'src/factories';
import { buildArray } from 'support/util/arrays';
import { DateTime } from 'luxon';
import { randomLabel, randomNumber } from 'support/util/random';

describe('Notifications Menu', () => {
  /*
   * - Confirms that the notification menu shows all events when 20 or fewer exist.
   */
  it('Shows all recent events when there are 20 or fewer', () => {
    const mockEvents = buildArray(randomNumber(1, 20), (index) => {
      return eventFactory.build({
        action: 'linode_delete',
        // The response from the API will be ordered by created date, descending.
        created: DateTime.local().minus({ minutes: index }).toISO(),
        percent_complete: null,
        rate: null,
        seen: false,
        duration: null,
        status: 'scheduled',
        entity: {
          id: 1000 + index,
          label: `my-linode-${index}`,
          type: 'linode',
          url: `/v4/linode/instances/${1000 + index}`,
        },
        username: randomLabel(),
      });
    });

    mockGetEvents(mockEvents).as('getEvents');
    cy.visitWithLogin('/');
    cy.wait('@getEvents');

    ui.appBar.find().within(() => {
      cy.findByLabelText('Notifications')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.get('[data-qa-notification-menu]')
      .should('be.visible')
      .within(() => {
        // Confirm that all mocked events are shown in the notification menu.
        mockEvents.forEach((event) => {
          cy.get(`[data-qa-event="${event.id}"]`)
            .as('qaEventId')
            .scrollIntoView();
          cy.get('@qaEventId').should('be.visible');
        });
      });
  });

  /*
   * - Confirms that the notification menu shows no more than 20 events.
   * - Confirms that only the most recently created events are shown.
   */
  it('Shows the 20 most recently created events', () => {
    const mockEvents = buildArray(25, (index) => {
      return eventFactory.build({
        action: 'linode_delete',
        // The response from the API will be ordered by created date, descending.
        created: DateTime.local().minus({ minutes: index }).toISO(),
        percent_complete: null,
        rate: null,
        seen: false,
        duration: null,
        status: 'scheduled',
        entity: {
          id: 1000 + index,
          label: `my-linode-${index}`,
          type: 'linode',
          url: `/v4/linode/instances/${1000 + index}`,
        },
        username: randomLabel(),
      });
    });

    const shownEvents = mockEvents.slice(0, 20);
    const hiddenEvents = mockEvents.slice(20);

    mockGetEvents(mockEvents).as('getEvents');
    cy.visitWithLogin('/');
    cy.wait('@getEvents');

    ui.appBar.find().within(() => {
      cy.findByLabelText('Notifications')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.get('[data-qa-notification-menu]')
      .should('be.visible')
      .within(() => {
        // Confirm that first 20 events in response are displayed.
        shownEvents.forEach((event) => {
          cy.get(`[data-qa-event="${event.id}"]`)
            .as('qaEventId')
            .scrollIntoView();
          cy.get('@qaEventId').should('be.visible');
        });

        // Confirm that last 5 events in response are not displayed.
        hiddenEvents.forEach((event) => {
          cy.get(`[data-qa-event="${event.id}"]`).should('not.exist');
        });
      });
  });

  /*
   * - Confirms that notification menu contains a notice when no recent events exist.
   */
  it('Shows notice when there are no recent events', () => {
    mockGetEvents([]).as('getEvents');
    cy.visitWithLogin('/');
    cy.wait('@getEvents');

    // Find and click Notifications button in Cloud's top app bar.
    ui.appBar.find().within(() => {
      cy.findByLabelText('Notifications')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.get('[data-qa-notification-menu]')
      .should('be.visible')
      .within(() => {
        // Use RegEx here to account for cases where the period is and is not present.
        // Period is displayed in Notifications Menu v2, but omitted in v1.
        cy.findByText(/No recent events to display\.?/).should('be.visible');
      });
  });

  /*
   * - Confirms that events in menu are marked as seen upon viewing.
   * - Uses typical mock data setup where IDs are ordered (descending) and all create dates are unique.
   * - Confirms that events are reflected in the UI as being seen or unseen.
   */
  it('Marks events in menu as seen', () => {
    const mockEvents = buildArray(10, (index) => {
      return eventFactory.build({
        // The event with the highest ID is expected to come first in the array.
        id: 5000 - index,
        action: 'linode_delete',
        // The response from the API will be ordered by created date, descending.
        created: DateTime.local().minus({ minutes: index }).toISO(),
        percent_complete: null,
        seen: false,
        rate: null,
        duration: null,
        status: 'scheduled',
        entity: {
          id: 1000 + index,
          label: `my-linode-${index}`,
          type: 'linode',
          url: `/v4/linode/instances/${1000 + index}`,
        },
        username: randomLabel(),
      });
    });

    // In this case, we know that the first event in the mocked events response
    // will contain the highest event ID.
    const highestEventId = mockEvents[0].id;

    mockGetEvents(mockEvents).as('getEvents');
    mockMarkEventSeen(highestEventId).as('markEventsSeen');

    cy.visitWithLogin('/');
    cy.wait('@getEvents');

    // Find and click Notifications button in Cloud's top app bar.
    ui.appBar.find().within(() => {
      cy.findByLabelText('Notifications')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    // Confirm notification menu opens
    cy.get('[data-qa-notification-menu]')
      .should('be.visible')
      .within(() => {
        // Confirm that UI reflects that every event is unseen.
        cy.get('[data-qa-event-seen="false"]').should('have.length', 10);
      });

    // Dismiss the notifications menu by clicking the bell button again.
    ui.appBar.find().within(() => {
      // This time we have to pass `force: true` to cy.click()
      // because otherwise Cypress thinks the element is blocked because
      // of the notifications menu popover.
      cy.findByLabelText('Notifications')
        .should('be.visible')
        .should('be.enabled')
        .click({ force: true });
    });

    // Confirm that Cloud fires a request to the `/events/:id/seen` endpoint,
    // where `id` corresponds to the mocked event with the highest ID.
    // If Cloud attempts to mark the wrong event ID as seen, this assertion
    // will fail.
    cy.log(`Waiting for request to '/events/${highestEventId}/seen'`);
    cy.wait('@markEventsSeen');

    ui.appBar.find().within(() => {
      cy.findByLabelText('Notifications')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.get('[data-qa-notification-menu]')
      .should('be.visible')
      .within(() => {
        // Confirm that UI reflects that every event is now seen.
        cy.get('[data-qa-event-seen="true"]').should('have.length', 10);
      });
  });

  /*
   * - Confirms event seen logic for non-typical event ordering edge case.
   * - Confirms that Cloud marks the correct event as seen even when it's not the first result.
   */
  it('Marks events in menu as seen with duplicate created dates and out-of-order IDs', () => {
    /*
     * When several events are triggered simultaneously, they may have the
     * same `created` timestamp. Cloud asks for events to be sorted by created
     * date when fetching from the API, but when events have identical timestamps,
     * there is no guarantee in which order they will be returned.
     *
     * As a result, we have to account for cases where the most recent event
     * in reality (e.g. as determined by its ID) is not returned first by the API.
     * This is especially relevant when marking events as 'seen', as we have
     * to explicitly mark the event with the highest ID as seen when the user
     * closes their notification menu.
     */
    const createTime = DateTime.local().minus({ minutes: 2 }).toISO();
    const mockEvents = buildArray(10, (index) => {
      return eventFactory.build({
        // Events are not guaranteed to be ordered by ID; simulate this by using random IDs.
        id: randomNumber(1000, 9999),
        action: 'linode_delete',
        // To simulate multiple events occurring simultaneously, give all
        // events the same created timestamp.
        created: createTime,
        percent_complete: null,
        seen: false,
        rate: null,
        duration: null,
        status: 'scheduled',
        entity: {
          id: 1000 + index,
          label: `my-linode-${index}`,
          type: 'linode',
          url: `/v4/linode/instances/${1000 + index}`,
        },
        username: randomLabel(),
      });
    });

    // Sort the mockEvents array by id in descending order to simulate API response
    mockEvents.sort((a, b) => b.id - a.id);

    const highestEventId = mockEvents[0].id;

    mockGetEvents(mockEvents).as('getEvents');
    mockMarkEventSeen(highestEventId).as('markEventsSeen');

    cy.visitWithLogin('/');
    cy.wait('@getEvents');

    // Find and click Notifications button in Cloud's top app bar.
    ui.appBar.find().within(() => {
      cy.findByLabelText('Notifications')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    // Confirm notification menu opens; we don't care about its contents.
    cy.get('[data-qa-notification-menu]').should('be.visible');

    // Dismiss the notifications menu by clicking the bell button again.
    ui.appBar.find().within(() => {
      // This time we have to pass `force: true` to cy.click()
      // because otherwise Cypress thinks the element is blocked because
      // of the notifications menu popover.
      cy.findByLabelText('Notifications')
        .should('be.visible')
        .should('be.enabled')
        .click({ force: true });
    });

    // Confirm that Cloud fires a request to the `/events/:id/seen` endpoint,
    // where `id` corresponds to the mocked event with the highest ID.
    // If Cloud attempts to mark the wrong event ID as seen, this assertion
    // will fail.
    cy.log(`Waiting for request to '/events/${highestEventId}/seen'`);
    cy.wait('@markEventsSeen');
  });
});
