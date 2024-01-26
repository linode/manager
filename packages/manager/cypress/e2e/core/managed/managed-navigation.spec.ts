/**
 * @file Integration tests for Managed navigation.
 */

import {
  contactFactory,
  credentialFactory,
  managedIssueFactory,
  monitorFactory,
} from 'src/factories/managed';
import { userPreferencesFactory } from 'src/factories/profile';
import { mockGetAccountSettings } from 'support/intercepts/account';
import {
  mockGetContacts,
  mockGetCredentials,
  mockGetIssues,
  mockGetServiceMonitors,
  mockGetStats,
  mockUnauthorizedManagedRequests,
} from 'support/intercepts/managed';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import {
  managedAccount,
  nonManagedAccount,
  visitUrlWithManagedDisabled,
  visitUrlWithManagedEnabled,
} from 'support/api/managed';
import type { UserPreferences } from '@linode/api-v4';

// Array of URLs to all Managed-related pages.
const managedURLs = [
  '/managed/summary',
  '/managed/monitors',
  '/managed/ssh-access',
  '/managed/credentials',
  '/managed/contacts',
];

// User preferences object to ensure that nav sidebar is open.
const userPreferences = userPreferencesFactory.build({
  // `false` corresponds to the sidebar being open.
  desktop_sidebar_open: false,
} as Partial<UserPreferences>);

describe('Managed navigation', () => {
  /*
   * - Confirms that "Managed" nav item is present when Managed is enabled.
   * - Confirms that clicking "Managed" nav item navigates to '/managed/summary'.
   * - Confirms that "Managed" nav item is not present when Managed is disabled.
   */
  it('shows Managed in sidebar when enabled', () => {
    // Confirm that Managed is in sidebar when it's enabled.
    mockGetAccountSettings(managedAccount).as('getAccountSettings');
    mockGetUserPreferences(userPreferences).as('getUserPreferences');
    cy.visitWithLogin('/linodes');
    cy.wait(['@getAccountSettings', '@getUserPreferences']);

    ui.nav.findItemByTitle('Managed').should('be.visible').click();

    cy.url().should('endWith', '/managed/summary');

    // Confirm that Managed is not in sidebar when it's not enabled.
    mockGetAccountSettings(nonManagedAccount).as('getAccountSettings');
    cy.visitWithLogin('/linodes');
    cy.wait(['@getAccountSettings', '@getUserPreferences']);

    ui.nav.find().within(() => {
      cy.findByText('Managed').should('not.exist');
    });
  });

  /*
   * - Confirms that Managed content is accessible when Managed is enabled.
   * - Confirms that Managed content is inaccessible when Managed is disabled.
   */
  it('allows access to Managed content when Managed is enabled', () => {
    // Confirm that Managed pages are accessible when Managed is enabled.
    // TODO Intercept Managed requests so that pages don't have unauthorized blocks.
    managedURLs.forEach((url) => {
      mockGetServiceMonitors(monitorFactory.buildList(5)).as(
        'getServiceMonitors'
      );
      mockGetIssues(managedIssueFactory.buildList(3)).as('getIssues');
      mockGetContacts(contactFactory.buildList(10)).as('getContacts');
      mockGetCredentials(credentialFactory.buildList(3)).as('getCredentials');
      mockGetStats().as('getStats');
      visitUrlWithManagedEnabled(url);

      // Wait for page to load and for "Managed" heading to be visible.
      ui.heading.findByText('Managed').should('be.visible');

      cy.findByText('Unauthorized').should('not.exist');
    });

    // Confirm that Managed pages are inaccessible when Managed is not enabled.
    managedURLs.forEach((url) => {
      mockUnauthorizedManagedRequests();
      visitUrlWithManagedDisabled(url);

      // The Managed SSH tab has two sections that can each display an "Unauthorized" notice.
      // We're using `findAllByText` to ensure that Cypress succeeds when both load at the same time.
      cy.findAllByText('Unauthorized').should('exist').should('be.visible');
    });
  });

  /*
   * - Confirms that navigating to Cloud Manager redirects you to Managed when Managed is enabled.
   * - Confirms that navigating to Cloud Manager does not redirect you to Managed when Managed is disabled.
   */
  it('redirects you to Managed when you visit Cloud Manager', () => {
    visitUrlWithManagedEnabled('/');
    cy.url().should('endWith', '/managed/summary');
    visitUrlWithManagedDisabled('/');
    cy.url().should('not.endWith', '/managed/summary');
  });
});
