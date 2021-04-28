import { notificationFactory } from '@src/factories/notification';
import { createLinode } from '../../support/api/linodes';
import { containsVisible, getClick } from '../../support/helpers';
import { makeResourcePage } from '@src/mocks/serverHandlers';

const migrationTicket = (label) => {
  return {
    type: 'migration_pending',
    message: `You have a migration pending! ${label} must be offline before starting the migration.`,
    entity: { id: 0, type: 'linode', label },
    severity: 'critical',
  };
};

const minorSeverityTicket = (_label) => {
  return {
    type: 'notice',
    message: 'Testing for minor notification',
    severity: 'minor',
  };
};

const balanceNotification = (_label) => {
  return {
    type: 'payment_due',
    message: 'You have an overdue balance!',
    severity: 'major',
  };
};

const data = [migrationTicket, minorSeverityTicket, balanceNotification];

// to do: add icon validation for each notification type and add abuseTicket = abuseTicketNotificationFactory
describe('notifications', () => {
  data.forEach((notification) => {
    it(`${notification('').type} notification`, () => {
      createLinode().then((linode) => {
        const request: Record<string, unknown> = notification(linode.label);
        cy.intercept('GET', '*/account/notifications*', (req) => {
          req.reply((res) => {
            res.send(
              makeResourcePage(notificationFactory.buildList(1, request))
            );
          });
        }).as('mockNotification');
        cy.visitWithLogin('/linodes');
        cy.wait('@mockNotification');
        cy.get(`[data-qa-linode="${linode.label}"]`).within(() => {
          containsVisible('Running');
        });
        getClick('button[aria-label="Notifications"]');
        containsVisible(request.message);
      });
    });
  });
});
