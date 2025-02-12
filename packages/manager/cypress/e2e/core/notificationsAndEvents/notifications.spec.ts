import { Notification } from '@linode/api-v4';
import { notificationFactory } from '@src/factories/notification';
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
