/**
 * @file Integration Tests for CloudPulse Alerting — Notification Channel Listing Page
 *
 * Covers four access-control behaviors:
 * 1. Access is allowed when `notificationChannels` is true.
 * 2. Navigation/tab visibility is blocked when `notificationChannels` is false.
 * 3. Direct URL access is blocked when `notificationChannels` is false.
 * 4. All access is blocked when CloudPulse (`aclp`) is disabled.
 */

import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';

import { accountFactory } from 'src/factories';

import type { Flags } from 'src/featureFlags';

describe('Notification Channel Listing Page — Access Control', () => {
  beforeEach(() => {
    mockGetAccount(accountFactory.build());
  });

  it('allows access when notificationChannels is enabled', () => {
    const flags: Partial<Flags> = {
      aclp: { beta: true, enabled: true },
      aclpAlerting: {
        accountAlertLimit: 10,
        accountMetricLimit: 10,
        alertDefinitions: true,
        beta: true,
        recentActivity: false,
        notificationChannels: true,
      },
    };

    mockAppendFeatureFlags(flags);
    cy.visitWithLogin('/linodes');

    ui.nav.findItemByTitle('Alerts').should('be.visible').click();
    ui.tabList.findTabByTitle('Notification Channels').should('be.visible').click();

    cy.url().should('endWith', 'alerts/notification-channels');
  });

 
  it('hides the Notification Channels tab when notificationChannels is disabled', () => {
    const flags: Partial<Flags> = {
      aclp: { beta: true, enabled: true },
      aclpAlerting: {
        accountAlertLimit: 10,
        accountMetricLimit: 10,
        alertDefinitions: true,
        beta: true,
        recentActivity: false,
        notificationChannels: false,
      },
    };

    mockAppendFeatureFlags(flags);
    cy.visitWithLogin('/linodes');

    ui.nav.findItemByTitle('Alerts').should('be.visible').click();

    // Tab should not render at all
    ui.tabList.findTabByTitle('Notification Channels').should('not.exist');
  });


  it('blocks all access when CloudPulse is disabled', () => {
    const flags: Partial<Flags> = {
      aclp: { beta: true, enabled: false }, // CloudPulse OFF
      aclpAlerting: {
        accountAlertLimit: 10,
        accountMetricLimit: 10,
        alertDefinitions: true,
        beta: true,
        recentActivity: false,
        notificationChannels: true,
      },
    };

    mockAppendFeatureFlags(flags);
    cy.visitWithLogin('/alerts/notification-channels');

    // Application should return fallback
    cy.findByText('Not Found').should('be.visible');
  });

  it('blocks direct URL access to /alerts/notification-channels when notificationChannels is disabled', () => {
    const flags: Partial<Flags> = {
      aclp: { beta: true, enabled: true },

      aclpAlerting: {
        accountAlertLimit: 10,
        accountMetricLimit: 10,
        alertDefinitions: true,
        beta: true,
        recentActivity: false,
        notificationChannels: false, // feature OFF → user should not enter page
      },
    };

    mockAppendFeatureFlags(flags);
    cy.visitWithLogin('/alerts/notification-channels');
    // Tab must not exist
    ui.tabList.findTabByTitle('Notification Channels').should('not.exist');
  });
});
