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

// interface MN {
//   type: string;
//   entity: Record<string, unknown>;
//   message: string;
//   severity: string;
// }

// const defaultMN = {
//   type: null,
//   entity: null,
//   message: null,
//   severity: null
// };

// const updateMN = (mn: MN, update: Partial<MN>) => {
//   return {...mn, ...update}
// };

const migrationTicket = (linode) => {
  return notificationFactory.buildList(1, {
    type: 'migration_pending',
    entity: { id: 0, type: 'linode', label: linode.label },
    severity: 'critical',
  });
};

const minorSeverityTicket = (_linode) => {
  return notificationFactory.buildList(1, {
    type: 'notice',
    message: 'Testing for minor notification',
    severity: 'minor',
  });
};

const data = [migrationTicket, minorSeverityTicket];

// const balanceNotification = notificationFactory.build({
//   type: 'payment_due',
//   message: 'You have an overdue balance!',
//   severity: 'major',
// });

// const abuseTicket = abuseTicketNotificationFactory;

describe('notifications', () => {
  data.forEach((d) => {
    it(`Verify ${d} Notifications`, () => {
      createLinode().then((linode) => {
        const payload = d(linode);
        const message = payload.toString;
        console.log(message);
        cy.intercept('GET', '*/account/notifications*', (req) => {
          req.reply((res) => {
            res.send(makeResourcePage(payload));
          });
        }).as('mockNotification');
        cy.visitWithLogin('/linodes');
        cy.wait('@mockNotification');
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

  //   it.skip('Verify Minor Severity Ticket Notifications', () => {
  //     const message = 'Testing for minor notification';
  //     createLinode().then((linode) => {
  //       cy.intercept('GET', '*/account/notifications*', (req) => {
  //         req.reply((res) => {
  //           res.send(makeResourcePage(minorSeverityTicket));
  //         });
  //       }).as('mockNotification');
  //       cy.visitWithLogin('/linodes');
  //       cy.wait('@mockNotification');
  //       cy.get(`[data-qa-linode="${linode.label}"]`).within(() => {
  //         containsVisible('Running');
  //       });
  //       getClick('button[aria-label="Notifications"]');
  //       containsVisible(message);
  //     });
  //   });
});
