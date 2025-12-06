/**
 * @file Integration Tests for CloudPulse Alerting — Notification Channel Listing Page
 */

import { profileFactory } from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetAlertChannels } from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';

import {
  accountFactory,
  flagsFactory,
  notificationChannelFactory,
} from 'src/factories';
import { formatDate } from 'src/utilities/formatDate';

import type { NotificationChannel } from '@linode/api-v4';

let notificationChannels = notificationChannelFactory.buildList(26);

notificationChannels = notificationChannels.map((ch, i) => {
  const alertCount = i % 2 === 0 ? 5 : 3;
  const channelType = i % 2 === 0 ? 'user' : 'system';

  return {
    ...ch,
    type: channelType,
    created_by: channelType,
    updated_by: channelType,
    updated: new Date().toISOString(),

    alerts: Array.from({ length: alertCount }).map((_, idx) => ({
      id: idx + 1,
      label: `Alert-${idx + 1}`,
      type: 'alerts-definitions',
      url: 'Sample',
    })),
  };
});

const isEmailContent = (
  content: NotificationChannel['content']
): content is {
  email: {
    email_addresses: string[];
    message: string;
    subject: string;
  };
} => 'email' in content;
const mockProfile = profileFactory.build({
  timezone: 'gmt',
});
const verifyChannelSorting = (
  columnLabel: string,
  sortOrder: 'ascending' | 'descending',
  expected: number[]
) => {
  // Initial click
  cy.get(`[data-qa-header="${columnLabel}"]`).click({ force: true });

  // Wait for DOM update, then check and correct
  cy.get(`[data-qa-header="${columnLabel}"]`)
    .invoke('attr', 'aria-sort')
    .then((current) => {
      if (current !== sortOrder) {
        // Click again ONLY if needed
        cy.get(`[data-qa-header="${columnLabel}"]`).click({ force: true });
      }
    });

  // Now assert stable final state (Cypress auto-retries this)
  cy.get(`[data-qa-header="${columnLabel}"]`).should(
    'have.attr',
    'aria-sort',
    sortOrder
  );

  // Validate row order
  cy.get('[data-qa="notification-channels-table"] tbody:last-of-type tr').then(
    ($rows) => {
      const actualOrder = $rows
        .toArray()
        .map((row) =>
          Number(row.getAttribute('data-qa-notification-channel-cell'))
        );

      cy.log(`Actual order: ${actualOrder.join(', ')}`);
      cy.log(`Expected order: ${expected.join(', ')}`);

      expect(actualOrder).to.deep.equal(expected);
    }
  );
};
describe('Notification Channel Listing Page', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetProfile(mockProfile);
    mockGetAccount(accountFactory.build());
    mockGetAlertChannels(notificationChannels).as(
      'getAlertNotificationChannels'
    );
    cy.visitWithLogin('/alerts/notification-channels');
    cy.wait('@getAlertNotificationChannels');
  });

  it('displays notification channel data correctly', () => {
    cy.wait('@getAlertNotificationChannels').then(({ response }) => {
      const body = response?.body;
      const data = body?.data;

      const channels = data as NotificationChannel[];

      expect(body?.results).to.eq(notificationChannels.length);

      channels.forEach((item, index) => {
        const expected = notificationChannels[index];

        // Basic fields
        expect(item.id).to.eq(expected.id);
        expect(item.label).to.eq(expected.label);
        expect(item.type).to.eq(expected.type);
        expect(item.status).to.eq(expected.status);
        expect(item.channel_type).to.eq(expected.channel_type);

        // Creator/updater fields
        expect(item.created_by).to.eq(expected.created_by);
        expect(item.updated_by).to.eq(expected.updated_by);

        // Email content (safe narrow)
        if (isEmailContent(item.content) && isEmailContent(expected.content)) {
          expect(item.content.email.email_addresses).to.deep.eq(
            expected.content.email.email_addresses
          );
          expect(item.content.email.subject).to.eq(
            expected.content.email.subject
          );
          expect(item.content.email.message).to.eq(
            expected.content.email.message
          );
        }

        // Alerts list
        expect(item.alerts.length).to.eq(expected.alerts.length);

        item.alerts.forEach((alert, aIndex) => {
          const expAlert = expected.alerts[aIndex];

          expect(alert.id).to.eq(expAlert.id);
          expect(alert.label).to.eq(expAlert.label);
          expect(alert.type).to.eq(expAlert.type);
          expect(alert.url).to.eq(expAlert.url);
        });
      });
    });
  });
  it('searches and validates notification channel details', () => {
    cy.findByPlaceholderText('Search for Notification Channels').as(
      'searchInput'
    );
    // Change pagination size selection from "Show 25" to "Show 100".
    ui.pagination.findPageSizeSelect().click();
    cy.get('[data-qa-pagination-page-size-option="100"]')
      .should('exist')
      .click();

    // Before clearing the search input, verify the table shows all rows
    cy.get('[data-qa="notification-channels-table"]')
      .find('tbody')
      .last()
      .within(() => {
        cy.get('tr').should('have.length', 26);
      });

    cy.get('@searchInput').clear();
    cy.get('@searchInput').type('Channel-10');
    cy.get('[data-qa="notification-channels-table"]')
      .find('tbody')
      .last()
      .within(() => {
        cy.get('tr').should('have.length', 1);

        cy.get('tr').each(($row) => {
          const expected = notificationChannels[9];

          cy.wrap($row).within(() => {
            cy.findByText(expected.label).should('be.visible');
            cy.findByText(String(expected.alerts.length)).should('be.visible');
            cy.findByText('Email').should('be.visible');
            cy.get('td').eq(3).should('have.text', expected.created_by);
            cy.findByText(
              formatDate(expected.updated, {
                format: 'MMM dd, yyyy, h:mm a',
                timezone: 'GMT',
              })
            ).should('be.visible');
            cy.get('td').eq(5).should('have.text', expected.updated_by);
          });
        });
      });
  });

  it('sorting and validates notification channel details', () => {
    const fixedDates = [
      '2024-01-01T10:00:00Z',
      '2024-01-01T11:15:00Z',
      '2024-01-01T12:30:00Z',
      '2024-01-01T13:45:00Z',
      '2024-01-01T15:00:00Z',
    ];

    const sortColumns = [
      {
        column: 'Channel Name',
        ascending: [1, 2, 3, 4, 5],
        descending: [5, 4, 3, 2, 1],
      },
      {
        column: 'Alerts',
        ascending: [2, 4, 1, 3, 5],
        descending: [1, 3, 5, 2, 4],
      },
      {
        column: 'Channel Type',
        ascending: [1, 3, 5, 2, 4],
        descending: [2, 4, 1, 3, 5],
      },
      {
        column: 'Created By',
        ascending: [2, 4, 1, 3, 5],
        descending: [1, 3, 5, 2, 4],
      },
      {
        column: 'Last Modified',
        ascending: [1, 2, 3, 4, 5],
        descending: [5, 4, 3, 2, 1],
      },
      {
        column: 'Last Modified By',
        ascending: [2, 4, 1, 3, 5],
        descending: [1, 3, 5, 2, 4],
      },
    ];

    let notificationChannels = notificationChannelFactory.buildList(5);

    notificationChannels = notificationChannels.map((ch, i) => {
      const isEmail = i % 2 === 0;

      const alerts = Array.from({ length: isEmail ? 5 : 3 }).map((_, idx) => ({
        id: idx + 1,
        label: `Alert-${idx + 1}`,
        type: 'alerts-definitions',
        url: 'Sample',
      }));

      if (isEmail) {
        return {
          ...ch,
          id: i + 1,
          label: `Channel-${i + 1}`,
          type: 'user',
          created_by: 'user',
          updated_by: 'user',
          updated: fixedDates[i],
          channel_type: 'email',
          alerts,
          content: {
            email: {
              email_addresses: [`test-${i + 1}@example.com`],
              subject: 'Test Subject',
              message: 'Test message',
            },
          },
        } as NotificationChannel;
      } else {
        return {
          ...ch,
          id: i + 1,
          label: `Channel-${i + 1}`,
          type: 'system',
          created_by: 'system',
          updated_by: 'system',
          updated: fixedDates[i],
          channel_type: 'webhook',
          alerts,
          content: {
            webhook: {
              webhook_url: `https://example.com/webhook/${i + 1}`,
              http_headers: [
                {
                  header_key: 'Authorization',
                  header_value: 'Bearer secret-token',
                },
              ],
            },
          },
        } as NotificationChannel;
      }
    });

    mockGetAlertChannels(notificationChannels).as('getNotificationChannels');

    cy.visitWithLogin('/alerts/notification-channels');
    cy.wait('@getNotificationChannels');
    cy.get('[data-qa="notification-channels-table"] thead th').as('headers');

    cy.get('@headers').then(($headers) => {
      const actual = Array.from($headers)
        .map((th) => th.textContent ?? '')
        .filter(Boolean);

      expect(actual.length).to.equal(6);

      expect(actual).to.deep.equal([
        'Channel Name',
        'Alerts',
        'Channel Type',
        'Created By',
        'Last Modified',
        'Last Modified By',
      ]);
    });

    sortColumns.forEach(({ column, ascending, descending }) => {
      verifyChannelSorting(column, 'ascending', ascending);
      verifyChannelSorting(column, 'descending', descending);
    });
  });
});
