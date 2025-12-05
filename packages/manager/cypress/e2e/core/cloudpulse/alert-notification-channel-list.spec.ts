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

describe('Notification Channel Listing Page', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetProfile(mockProfile);
    mockGetAccount(accountFactory.build());
    mockGetAlertChannels(notificationChannels).as(
      'getAlertNotificationChannels'
    );
    cy.visitWithLogin('/alerts/notification-channels');
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
});
