/**
 * @file Integration Tests for CloudPulse Alerting — Notification Channel Listing Page
 */
import { profileFactory } from '@linode/utilities';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockDeleteChannel,
  mockDeleteChannelError,
  mockGetAlertChannels,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';

import {
  accountFactory,
  flagsFactory,
  notificationChannelFactory,
} from 'src/factories';
import {
  channelTypeMap,
  DELETE_CHANNEL_FAILED_MESSAGE,
  DELETE_CHANNEL_SUCCESS_MESSAGE,
  DELETE_CHANNEL_TOOLTIP_TEXT,
} from 'src/features/CloudPulse/Alerts/constants';
import {
  ChannelAlertsTooltipText,
  ChannelListingTableLabelMap,
} from 'src/features/CloudPulse/Alerts/NotificationChannels/NotificationsChannelsListing/constants';
import { formatDate } from 'src/utilities/formatDate';

import type { EmailRecipientType, NotificationChannel } from '@linode/api-v4';

const sortOrderMap = {
  ascending: 'asc',
  descending: 'desc',
};

const LabelLookup = Object.fromEntries(
  ChannelListingTableLabelMap.map((item) => [item.colName, item.label])
);

type SortOrder = 'ascending' | 'descending';

interface VerifyChannelSortingParams {
  columnLabel: string;
  expected: number[];
  sortOrder: SortOrder;
}

// Helper to generate alerts
const generateAlerts = (numAlerts: number) => ({
  alert_count: numAlerts,
  type: 'alerts-definitions' as const,
  url: '/monitor/alert-channels/alerts',
});

const guaranteedChannels: NotificationChannel[] = [
  notificationChannelFactory.build({
    id: 1,
    label: 'Email-System-0Alerts',
    type: 'system',
    channel_type: 'email',
    alerts: generateAlerts(0),
  }),
  notificationChannelFactory.build({
    id: 2,
    label: 'Email-User-0Alerts',
    type: 'user',
    channel_type: 'email',
    alerts: generateAlerts(0),
  }),
  notificationChannelFactory.build({
    id: 3,
    label: 'Webhook-System-3Alerts',
    type: 'system',
    channel_type: 'webhook',
    alerts: generateAlerts(3),
  }),
  notificationChannelFactory.build({
    id: 4,
    label: 'Webhook-User-3Alerts',
    type: 'user',
    channel_type: 'webhook',
    alerts: generateAlerts(3),
  }),
  notificationChannelFactory.build({
    id: 5,
    label: 'email-User-3Alerts',
    type: 'user',
    channel_type: 'email',
    alerts: generateAlerts(3),
  }),
];

// Generate remaining channels up to 26
const remainingChannels: NotificationChannel[] = Array.from(
  { length: 26 - guaranteedChannels.length },
  (_, idx) => {
    const id = guaranteedChannels.length + idx + 1;
    const type: 'system' | 'user' = Math.random() < 0.5 ? 'user' : 'system';
    const channelType: 'email' | 'webhook' =
      Math.random() < 0.5 ? 'email' : 'webhook';
    const alertsCount = Math.random() < 0.5 ? 0 : 3;

    return notificationChannelFactory.build({
      id,
      label: `Channel-${id}`,
      type,
      channel_type: channelType,
      alerts: generateAlerts(alertsCount),
    });
  }
);

const notificationChannels = [...guaranteedChannels, ...remainingChannels];

/**
 * Finds a notification channel by channel_type, owner type, and alerts length,
 * and returns its NotificationChannel object.
 *
 * Throws an error if no matching channel is found.
 * This guarantees the return type is always 'NotificationChannel'.
 */
const findChannel = (
  // List of all notification channels to search
  channels: NotificationChannel[],

  channelType: NotificationChannel['channel_type'],

  // Owner/type of the channel (e.g. 'user', 'system')
  channelOwnerType: NotificationChannel['type'],

  // Expected number of alerts (use 0 for "no alerts")
  alertsLength: number
): NotificationChannel => {
  // Find the first channel that matches all criteria
  const channel = channels.find(
    (ch) =>
      ch.channel_type === channelType &&
      ch.type === channelOwnerType &&
      // Special handling for zero alerts:
      // alerts may be undefined or an empty array
      (alertsLength === 0
        ? !ch.alerts || ch.alerts.alert_count === 0
        : ch.alerts?.alert_count === alertsLength)
  );

  // Fail fast if no matching channel is found
  if (!channel) {
    throw new Error(
      `No channel found with channel_type=${channelType}, type=${channelOwnerType}, alertsLength=${alertsLength}`
    );
  }

  // Safe to return: channel is guaranteed to exist
  return channel;
};
const { label: userChannelLabel, id: userChannelId } = findChannel(
  notificationChannels,
  'email', // channel_type
  'user', // channel owner/type
  0 // alertsLength (0 = no alerts)
);

const isEmailChannel = (
  details: NotificationChannel['details']
): details is {
  email: {
    recipient_type: EmailRecipientType;
    usernames: string[];
  };
} => details !== undefined && 'email' in details;
const mockProfile = profileFactory.build({
  timezone: 'gmt',
});

/**
 * Verifies sorting of a column in the alerts table.
 *
 * @param params - Configuration object for sorting verification.
 * @param params.columnLabel - The label of the column to sort.
 * @param params.sortOrder - Expected sorting order (ascending | descending).
 * @param params.expected - Expected row order after sorting.
 */
const VerifyChannelSortingParams = (
  columnLabel: string,
  sortOrder: 'ascending' | 'descending',
  expected: number[]
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
          Number(row.getAttribute('data-qa-notification-channel-cell'))
        );
      expect(actualOrder).to.eqls(expected);
    }
  );

  const order = sortOrderMap[sortOrder];
  const orderBy = encodeURIComponent(LabelLookup[columnLabel]);

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
    mockDeleteChannel(userChannelId).as('deleteNotificationChannel');
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
        if (isEmailChannel(item.details) && isEmailChannel(expected.details)) {
          expect(item.details.email.usernames).to.deep.eq(
            expected.details.email.usernames
          );
          expect(item.details.email.recipient_type).to.eq(
            expected.details.email.recipient_type
          );
        }

        // Alerts list
        expect(item.alerts.alert_count).to.eq(expected.alerts.alert_count);
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
            cy.findByText(String(expected.alerts.alert_count)).should(
              'be.visible'
            );
            cy.findByText(channelTypeMap[expected.channel_type]).should(
              'be.visible'
            );
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
          .map((ch) => ch.id),

        descending: [...notificationChannels]
          .sort((a, b) => b.label.localeCompare(a.label))
          .map((ch) => ch.id),
      },
      {
        column: 'Alerts',
        ascending: [...notificationChannels]
          .sort((a, b) => a.alerts.alert_count - b.alerts.alert_count)
          .map((ch) => ch.id),

        descending: [...notificationChannels]
          .sort((a, b) => b.alerts.alert_count - a.alerts.alert_count)
          .map((ch) => ch.id),
      },

      {
        column: 'Channel Type',
        ascending: [...notificationChannels]
          .sort((a, b) => a.channel_type.localeCompare(b.channel_type))
          .map((ch) => ch.id),

        descending: [...notificationChannels]
          .sort((a, b) => b.channel_type.localeCompare(a.channel_type))
          .map((ch) => ch.id),
      },

      {
        column: 'Created By',
        ascending: [...notificationChannels]
          .sort((a, b) => a.created_by.localeCompare(b.created_by))
          .map((ch) => ch.id),

        descending: [...notificationChannels]
          .sort((a, b) => b.created_by.localeCompare(a.created_by))
          .map((ch) => ch.id),
      },
      {
        column: 'Last Modified',
        ascending: [...notificationChannels]
          .sort((a, b) => a.updated.localeCompare(b.updated))
          .map((ch) => ch.id),

        descending: [...notificationChannels]
          .sort((a, b) => b.updated.localeCompare(a.updated))
          .map((ch) => ch.id),
      },
      {
        column: 'Last Modified By',
        ascending: [...notificationChannels]
          .sort((a, b) => a.updated_by.localeCompare(b.updated_by))
          .map((ch) => ch.id),

        descending: [...notificationChannels]
          .sort((a, b) => b.updated_by.localeCompare(a.updated_by))
          .map((ch) => ch.id),
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
      VerifyChannelSortingParams(column, 'ascending', ascending);
      VerifyChannelSortingParams(column, 'descending', descending);
    });
  });

  it('deletes a user-type email notification channel with no alerts', () => {
    cy.findByPlaceholderText('Search for Notification Channels').as(
      'searchInput'
    );

    cy.get('@searchInput').clear();
    cy.get('@searchInput').type(userChannelLabel);

    ui.actionMenu
      .findByTitle(`Action menu for Notification Channel ${userChannelLabel}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

    ui.dialog
      .findByTitle(`Delete ${userChannelLabel}?`)
      .should('be.visible')
      .within(() => {
        // Focus the "Alert Label" confirmation input
        cy.findByLabelText('Notification Channel Label').click();

        // Type the alert label to enable the Delete button
        cy.focused().type(userChannelLabel);

        // Click the Delete button to confirm
        ui.buttonGroup
          .findButtonByTitle('Delete')
          .should('be.enabled')
          .should('be.visible')
          .click();
      });
    ui.toast.assertMessage(DELETE_CHANNEL_SUCCESS_MESSAGE);
  });

  it('disable deletion of a user-type email notification channel with alerts', () => {
    // --- Arrange: Find a channel that has at least 1 alert ---
    const { label: userChannelLabel } = findChannel(
      notificationChannels,
      'email', // channel_type
      'user', // owner/type
      3 // alertsLength: at least 1 alert
    );

    // --- Act: Search for the channel ---
    cy.findByPlaceholderText('Search for Notification Channels').as(
      'searchInput'
    );

    cy.get('@searchInput').clear();
    cy.get('@searchInput').type(userChannelLabel);

    // --- Act: Open action menu ---
    ui.actionMenu
      .findByTitle(`Action menu for Notification Channel ${userChannelLabel}`)
      .should('be.visible')
      .click();

    ui.tooltip.findByText(DELETE_CHANNEL_TOOLTIP_TEXT).should('be.visible');

    // --- Act: Click Delete action ---
    ui.actionMenuItem
      .findByTitle('Delete')
      .should('be.visible')
      .should('be.disabled');
  });

  it('ensures system-type channels never show the Delete button', () => {
    // --- User-type email channel with alerts ---
    const { label: systemChannelLabel } = findChannel(
      notificationChannels,
      'email', // channel_type
      'system', // type/owner
      0 // alertsLength = 0
    );

    // --- Act: Search for the channel ---
    cy.findByPlaceholderText('Search for Notification Channels').as(
      'searchInput'
    );

    cy.get('@searchInput').clear();
    cy.get('@searchInput').type(systemChannelLabel);

    // Open action menu
    ui.actionMenu
      .findByTitle(`Action menu for Notification Channel ${systemChannelLabel}`)
      .should('be.visible')
      .click();

    // Delete button should NOT exist for system-type channels
    cy.get('div[data-qa-action-menu="true"]') // targets the opened popover
      .within(() => {
        // Assert Delete button does NOT exist
        cy.get('[data-qa-action-menu-item="Delete"]').should('not.exist');

        // Optionally assert Show Details exists
        cy.get('[data-qa-action-menu-item="Show Details"]').should(
          'be.visible'
        );
      });
  });
  it('displays an error when deleting a notification channel fails', () => {
    const notificationChannel = notificationChannelFactory.build({
      id: 123,
      label: 'Channel-error',
      type: 'user',
      created_by: 'user',
      updated_by: 'user',
      channel_type: 'email',
      alerts: generateAlerts(0),
    });
    const userChannelLabel = notificationChannel.label;
    mockGetAlertChannels([notificationChannel]);

    // Arrange: Mock the DELETE API to return a 500 error
    mockDeleteChannelError(123).as('deleteChannel');
    cy.visitWithLogin('/alerts/notification-channels');

    // Act: Attempt to delete the channel
    ui.actionMenu
      .findByTitle(`Action menu for Notification Channel ${userChannelLabel}`)
      .should('be.visible')
      .click();

    ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();

    ui.dialog
      .findByTitle(`Delete ${userChannelLabel}?`)
      .should('be.visible')
      .within(() => {
        // Focus the "Alert Label" confirmation input
        cy.findByLabelText('Notification Channel Label').click();

        // Type the alert label to enable the Delete button
        cy.focused().type(userChannelLabel);

        // Click the Delete button to confirm
        ui.buttonGroup
          .findButtonByTitle('Delete')
          .should('be.enabled')
          .should('be.visible')
          .click();
      });
    ui.toast.assertMessage(DELETE_CHANNEL_FAILED_MESSAGE);
  });
});
