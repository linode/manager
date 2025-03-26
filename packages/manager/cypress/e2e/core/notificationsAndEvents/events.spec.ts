import { eventFactory } from '@src/factories/events';
import { mockGetEvents } from 'support/intercepts/events';
import { EventActionKeys } from '@linode/api-v4';

import type { Event } from '@linode/api-v4';

const events: Event[] = EventActionKeys.map((action) => {
  return eventFactory.build({
    action,
    message: `${action + ' message'}`,
    seen: false,
    read: false,
    percent_complete: null,
    entity: { id: 0, label: 'linode-0' },
  });
});

describe('verify notification types and icons', () => {
  it(`notifications`, () => {
    mockGetEvents(events).as('mockEvents');
    cy.visitWithLogin('/linodes');
    cy.wait('@mockEvents').then(() => {
      cy.get('button[aria-label="Notifications"]').click();
      for (let i = 0; i < 20; i++) {
        // Skip account_agreement_eu_model action since it is a special case
        if (events[i].action === 'account_agreement_eu_model') {
          return;
        }
        const text = [`${events[i].message}`, `${events[i].entity?.label}`];
        const regex = new RegExp(`${text.join('|')}`, 'g');
        cy.get(`[data-testid="${events[i].action}"]`).within(() => {
          cy.contains(regex);
        });
      }
      cy.get('button[aria-label="View all events"]').click();
      // Clicking "View all events" navigates to Events page at /events
      cy.url().should('endWith', '/events');
      events.forEach((event) => {
        const text = [`${event.message}`, `${event.entity?.label}`];
        const regex = new RegExp(`${text.join('|')}`, 'g');
        cy.get(`[data-testid="${event.action}"]`).within(() => {
          cy.contains(regex);
        });
      });
    });
  });
});
