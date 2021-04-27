// import { worker } from '@src/mocks/testBrowser';
import { waitForAppLoad } from '../../support/ui/common';
const oauthtoken = Cypress.env('MANAGER_OAUTH');
import {
  notificationFactory,
  abuseTicketNotificationFactory,
} from '@src/factories/notification';
import { createLinode } from '../../support/api/linodes';
import {
  containsVisible,
  fbtVisible,
  getClick,
  getVisible,
} from '../../support/helpers';
import { makeResourcePage } from '@src/mocks/serverHandlers';

const abuseTicket = abuseTicketNotificationFactory.build();

const minorSeverityTicket = notificationFactory.build({
  type: 'notice',
  message: 'Testing for minor notification',
  severity: 'minor',
});

const balanceNotification = notificationFactory.build({
  type: 'payment_due',
  message: 'You have an overdue balance!',
  severity: 'major',
});

describe('notifications', () => {
  it('Verify Mocked Notifications', () => {
    createLinode().then((linode) => {
      const migrationTicket = notificationFactory.buildList(1, {
        type: 'migration_pending',
        entity: { id: 0, type: 'linode', label: linode.label },
        severity: 'critical',
      });
      cy.intercept('GET', '*/account/notifications*', (req) => {
        req.reply((res) => {
          res.send(makeResourcePage(migrationTicket));
        });
      }).as('mockNotification');
      cy.visitWithLogin('/linodes');
      cy.wait('@mockNotification', { timeout: 300000 });
      cy.get(`[data-qa-linode="${linode.label}"]`).within(() => {
        containsVisible('Running');
      });
      getClick('button[aria-label="Notifications"]');
      containsVisible(
        `You have a migration pending! ${linode.label} must be offline before starting the migration.`
      );
    });
  });
});
