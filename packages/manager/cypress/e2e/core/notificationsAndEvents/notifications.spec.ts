import { notificationFactory } from '@src/factories/notification';
import { mockGetNotifications } from 'support/intercepts/events';

import type { Notification } from '@linode/api-v4';

const notifications: Notification[] = [
  notificationFactory.build({
    severity: 'critical',
    type: 'migration_scheduled',
  }),
  notificationFactory.build({ severity: 'major', type: 'migration_pending' }),
  notificationFactory.build({ severity: 'minor', type: 'reboot_scheduled' }),
  notificationFactory.build({ severity: 'critical', type: 'outage' }),
  notificationFactory.build({ severity: 'minor', type: 'ticket_important' }),
  notificationFactory.build({ severity: 'critical', type: 'ticket_abuse' }),
  notificationFactory.build({ severity: 'major', type: 'notice' }),
  notificationFactory.build({ severity: 'minor', type: 'maintenance' }),
  notificationFactory.build({ severity: 'critical', type: 'promotion' }),
];

describe('verify notification types and icons', () => {
  it(`notifications`, () => {
    mockGetNotifications(notifications).as('mockNotifications');
    cy.visitWithLogin('/linodes');
    cy.wait('@mockNotifications');
    cy.get('button[aria-label="Notifications"]').click();
    cy.get('[data-testid="showMoreButton"').click();
    notifications.forEach((notification) => {
      cy.get(`[data-testid="${notification.type}"]`).within(() => {
        if (notification.severity != 'minor') {
          cy.get(`[data-testid="${notification.severity + 'Icon'}"]`);
        }
      });
    });
  });
});
