import { Notification } from '@linode/api-v4';
import { notificationFactory } from '@src/factories/notification';
import { getClick } from 'support/helpers';
import { mockGetNotifications } from 'support/intercepts/events';

const notifications: Notification[] = [
  notificationFactory.build({
    type: 'migration_scheduled',
    severity: 'critical',
  }),
  notificationFactory.build({ type: 'migration_pending', severity: 'major' }),
  notificationFactory.build({ type: 'reboot_scheduled', severity: 'minor' }),
  notificationFactory.build({ type: 'outage', severity: 'critical' }),
  notificationFactory.build({ type: 'ticket_important', severity: 'minor' }),
  notificationFactory.build({ type: 'ticket_abuse', severity: 'critical' }),
  notificationFactory.build({ type: 'notice', severity: 'major' }),
  notificationFactory.build({ type: 'maintenance', severity: 'minor' }),
  notificationFactory.build({ type: 'promotion', severity: 'critical' }),
];

describe('verify notification types and icons', () => {
  it(`notifications`, () => {
    mockGetNotifications(notifications).as('mockNotifications');
    cy.visitWithLogin('/linodes');
    cy.wait('@mockNotifications');
    getClick('button[aria-label="Notifications"]');
    getClick('[data-test-id="showMoreButton"');
    notifications.forEach((notification) => {
      cy.get(`[data-test-id="${notification.type}"]`).within(() => {
        if (notification.severity != 'minor') {
          cy.get(`[data-test-id="${notification.severity + 'Icon'}"]`);
        }
      });
    });
  });
});
