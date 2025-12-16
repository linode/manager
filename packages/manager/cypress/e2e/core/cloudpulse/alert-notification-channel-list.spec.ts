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
import {
  ChannelAlertsTooltipText,
  ChannelListingTableLabelMap,
} from 'src/features/CloudPulse/Alerts/NotificationChannels/NotificationsChannelsListing/constants';
import { formatDate } from 'src/utilities/formatDate';

import type { NotificationChannel } from '@linode/api-v4';

const sortOrderMap = {
  ascending: 'asc',
  descending: 'desc',
};

const LabelLookup = Object.fromEntries(
  ChannelListingTableLabelMap.map((item) => [item.colName, item.label])
);

const notificationChannels = notificationChannelFactory
  .buildList(26)
  .map((ch, i) => {
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
        type: 'custom',
        created_by: 'user',
        updated_by: 'user',
        channel_type: 'email',
        updated: new Date(2024, 0, i + 1).toISOString(),
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
        type: 'default',
        created_by: 'system',
        updated_by: 'system',
        channel_type: 'webhook',
        updated: new Date(2024, 0, i + 1).toISOString(),
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

/**
 * Verifies sorting of a column in the alerts table.
 * @param {'ascending' | 'descending'} sortOrder - Expected sorting order.
 * @param {number[]} expectedValues - Expected values in sorted order.
 */
const verifyChannelSorting = (
  columnLabel: string,
  sortOrder: 'ascending' | 'descending',
  expected: string[]
) => {
  cy.get(`[data-qa-header="${columnLabel}"]`).click({ force: true });

  cy.get(`[data-qa-header="${columnLabel}"]`)
    .invoke('attr', 'aria-sort')
    .then((current) => {
      if (current !== sortOrder) {
        cy.get(`[data-qa-header="${columnLabel}"]`).click({ force: true });
      }
    });

  cy.get(`[data-qa-header="${columnLabel}"]`).should(
    'have.attr',
    'aria-sort',
    sortOrder
  );

  cy.get('[data-qa="notification-channels-table"] tbody:last-of-type tr').then(
    ($rows) => {
      const actualOrder = $rows
        .toArray()
        .map((row) =>
          String(row.getAttribute('data-qa-notification-channel-cell'))
        );
      expect(actualOrder).to.deep.equal(expected);
    }
  );

  const order = sortOrderMap[sortOrder];
  const orderBy = LabelLookup[columnLabel];

  cy.url().should(
    'endWith',
    `/alerts/notification-channels?order=${order}&orderBy=${orderBy}`
  );
};

describe('Notification Channel Listing Page', () => {
  /**
   * Validates the listing page for CloudPulse notification channels.
   * Confirms channel data rendering, search behavior, and table sorting
   * across all columns using a controlled 26-item mock dataset.
   */
  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetProfile(mockProfile);
    mockGetAccount(accountFactory.build());
    mockGetAlertChannels(notificationChannels).as(
      'getAlertNotificationChannels'
    );

    cy.visitWithLogin('/alerts/notification-channels');

    ui.pagination.findPageSizeSelect().click();

    cy.get('[data-qa-pagination-page-size-option="100"]')
      .should('exist')
      .click();

    ui.tooltip.findByText(ChannelAlertsTooltipText).should('be.visible');

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

    cy.get('[data-qa="notification-channels-table"]')
      .find('tbody')
      .last()
      .within(() => {
        cy.get('tr').should('have.length', 26);
      });

    cy.get('@searchInput').clear();
    cy.get('@searchInput').type('Channel-9');
    cy.get('[data-qa="notification-channels-table"]')
      .find('tbody')
      .last()
      .within(() => {
        cy.get('tr').should('have.length', 1);

        cy.get('tr').each(($row) => {
          const expected = notificationChannels[8];

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
    const sortColumns = [
      {
        column: 'Channel Name',
        ascending: [...notificationChannels]
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((ch) => String(ch.id)),

        descending: [...notificationChannels]
          .sort((a, b) => b.label.localeCompare(a.label))
          .map((ch) => String(ch.id)),
      },
      {
        column: 'Alerts',
        ascending: [...notificationChannels]
          .sort((a, b) => a.alerts.length - b.alerts.length)
          .map((ch) => String(ch.id)),

        descending: [...notificationChannels]
          .sort((a, b) => b.alerts.length - a.alerts.length)
          .map((ch) => String(ch.id)),
      },

      {
        column: 'Channel Type',
        ascending: [...notificationChannels]
          .sort((a, b) => a.channel_type.localeCompare(b.channel_type))
          .map((ch) => String(ch.id)),

        descending: [...notificationChannels]
          .sort((a, b) => b.channel_type.localeCompare(a.channel_type))
          .map((ch) => String(ch.id)),
      },

      {
        column: 'Created By',
        ascending: [...notificationChannels]
          .sort((a, b) => a.created_by.localeCompare(b.created_by))
          .map((ch) => String(ch.id)),

        descending: [...notificationChannels]
          .sort((a, b) => b.created_by.localeCompare(a.created_by))
          .map((ch) => String(ch.id)),
      },
      {
        column: 'Last Modified',
        ascending: [...notificationChannels]
          .sort((a, b) => a.updated.localeCompare(b.updated))
          .map((ch) => String(ch.id)),

        descending: [...notificationChannels]
          .sort((a, b) => b.updated.localeCompare(a.updated))
          .map((ch) => String(ch.id)),
      },
      {
        column: 'Last Modified By',
        ascending: [...notificationChannels]
          .sort((a, b) => a.updated_by.localeCompare(b.updated_by))
          .map((ch) => String(ch.id)),

        descending: [...notificationChannels]
          .sort((a, b) => b.updated_by.localeCompare(a.updated_by))
          .map((ch) => String(ch.id)),
      },
    ];

    cy.get('[data-qa="notification-channels-table"] thead th').as('headers');

    cy.get('@headers').then(($headers) => {
      const actual = Array.from($headers)
        .map((th) => th.textContent?.trim())
        .filter(Boolean);

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
