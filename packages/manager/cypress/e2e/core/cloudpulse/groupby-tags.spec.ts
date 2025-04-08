/**
 * @file Integration Tests for the CloudPulse Alerts Listing Page (Grouped by Tags).
 *
 * This spec verifies the grouping, display, and filtering behavior of alerts when grouped by tags.
 *
 * Summary:
 * - Ensures alerts are correctly grouped and displayed under their respective tag headers.
 * - Validates tag headers such as bothTags, evenTags, oddTags, and No Tags are rendered accurately.
 * - Confirms that searching by label filters the grouped alerts correctly.
 * - Checks that alerts not matching the search query are not displayed.
 * - Verifies the toggle functionality between grouped and ungrouped views.
 * - Ensures all relevant alert details (label, status, service_type, etc.) are visible and accurate.
 * - Validates that feature flags and user preferences are properly applied to the UI.
 */
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetAllAlertDefinitions,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { ui } from 'support/ui';

import { accountFactory, alertFactory } from 'src/factories';

import type { Alert, AlertServiceType, AlertStatusType } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

const flags: Partial<Flags> = { aclp: { beta: true, enabled: true } };
const mockAccount = accountFactory.build();

const statusList: AlertStatusType[] = [
  'enabled',
  'disabled',
  'in progress',
  'failed',
];
const serviceTypes: AlertServiceType[] = ['linode', 'dbaas'];

const tagSequence = ['LinodeTags', 'dbaasTags', 'bothTags', 'noTags'];

const mockAlerts = Array.from(
  { length: 5 },
  (_, index): Alert => {
    // Get tag directly from tagSequence, wrapping around if needed
    const tag = tagSequence[index % tagSequence.length];

    // If tag is 'noTags', use empty tags array
    const tags = tag === 'noTags' ? [] : [tag, 'bothTags'];

    // Get status and serviceType by cycling through the lists
    const status = statusList[index % statusList.length];
    const serviceType = serviceTypes[index % serviceTypes.length];

    // Determine primaryTag - 'noTags' if tags are empty, else use the first tag
    const primaryTag = tags.length === 0 ? 'noTags' : tags[0];

    // Generate label based on primaryTag and index
    const label = `${primaryTag}-${index}`;

    // Build and return the alert using the factory
    return alertFactory.build({
      created_by: primaryTag,
      label,
      service_type: serviceType,
      status,
      tags,
      type: 'user',
    });
  }
);

// Filter alerts that have both evenTags and oddTags
const bothTags: Alert[] = mockAlerts.filter(
  (alert) =>
    alert.tags.includes('LinodeTags') && alert.tags.includes('dbaasTags')
);

// Filter alerts that only have evenTags and do NOT include oddTags
const linodeTags: Alert[] = mockAlerts.filter(
  (alert) =>
    alert.tags.includes('LinodeTags') && !alert.tags.includes('dbaasTags')
);

// Filter alerts that only have oddTags and do NOT include evenTags
const dbaasTags: Alert[] = mockAlerts.filter(
  (alert) =>
    alert.tags.includes('LinodeTags') && !alert.tags.includes('LinodeTags')
);

// Filter alerts that do NOT include either evenTags or oddTags
const noTags: Alert[] = mockAlerts.filter(
  (alert) =>
    !alert.tags.includes('LinodeTags') && !alert.tags.includes('dbaasTags')
);

describe('Integration Tests for Grouping Alerts by Tags on the CloudPulse Alerts Listing Page', () => {
  /*
   * - Verifies alerts are displayed under correct tag headers when grouped by tag.
   * - Validates visibility of tag headers: bothTags, evenTags, oddTags, and No Tags.
   * - Confirms correct alerts appear under each tag grouping.
   * - Tests search functionality within grouped alerts.
   * - Ensures alerts not matching the search query are hidden.
   * - Verifies tag headers disappear when ungrouping by tag.
   * - Confirms user preferences and feature flags are applied properly.
   */
  it('Displays alerts accurately grouped under their corresponding tags', () => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetCloudPulseServices(['linode', 'dbaas']);
    mockGetAllAlertDefinitions(mockAlerts).as('getAlertDefinitionsList');
    mockGetUserPreferences({ aclpAlertsGroupByTag: false });
    cy.visitWithLogin('/alerts/definitions');
    cy.wait('@getAlertDefinitionsList');
    // Toggle to enable "Group by tag" view

    ui.button
      .findByAttribute('aria-label', 'Toggle group by tag')
      .should('be.visible')
      .click();

    // Confirm alert table headers are visible

    ui.heading.findByText('label').should('be.visible');
    ui.heading.findByText('status').should('be.visible');
    ui.heading.findByText('service_type').should('be.visible');
    ui.heading.findByText('created_by').should('be.visible');
    ui.heading.findByText('updated').should('be.visible');

    // Verify tooltip updates to show "Ungroup by tag"

    ui.tooltip.findByText('Ungroup by tag').should('be.visible');

    // Validate tag headers are displayed correctly

    cy.get('[data-qa-tag-header="bothTags"]').should('have.text', 'bothTags');
    cy.get('[data-qa-tag-header="LinodeTags"]').should(
      'have.text',
      'LinodeTags'
    );
    cy.get('[data-qa-tag-header="dbaasTags"]').should('have.text', 'dbaasTags');
    cy.get('[data-qa-tag-header="No Tags"]').should('have.text', 'No Tags');

    // Validate that all alerts are rendered and visible in their respective tag groups

    cy.get('[data-qa="alert-table"]').within(() => {
      const allAlerts = [...bothTags, ...linodeTags, ...dbaasTags, ...noTags];
      allAlerts.forEach(({ label }) => {
        cy.findAllByLabelText(label)
          .should('exist')
          .should('be.visible')
          .each(($el) => {
            cy.wrap($el).should('have.text', label);
          });
      });
    });
    // Search for a specific label within grouped alerts
    cy.findByPlaceholderText('Search for Alerts').type('dbaasTags-1');

    // Verify only matching alerts are visible

    const expectedAlerts = [...bothTags, ...dbaasTags].filter(({ label }) =>
      label.includes('dbaasTags-1')
    );

    expectedAlerts.forEach(({ label }) => {
      cy.findAllByLabelText(label)
        .should('exist')
        .should('be.visible')
        .each(($el) => {
          cy.wrap($el).should('have.text', label);
        });
    });

    // Ensure alerts that don't match the query are not displayed

    const nonMatchingAlerts = [...linodeTags, ...noTags];
    nonMatchingAlerts.forEach(({ label }) => {
      cy.findAllByLabelText(label).should('not.exist');
    });

    // Clear the search input to reset the table
    cy.findByPlaceholderText('Search for Alerts')
      .should('be.visible')
      .and('not.be.disabled')
      .clear();

    // Filter alerts by service type using the dropdown

    cy.findByPlaceholderText('Select a Service')
      .should('be.visible')
      .type('Databases{enter}');

    // Verify filtered alerts are shown under correct tag headers
    const labelToTagsMap = {
      'dbaasTags-1': ['bothTags', 'dbaasTags'],
      'noTags-3': ['No Tags'],
    };
    cy.get('[data-qa="alert-table"]').within(() => {
      Object.entries(labelToTagsMap).forEach(([label]) => {
        cy.findAllByLabelText(label)
          .should('be.visible')
          .each(($el) => {
            cy.wrap($el).should('be.visible').and('have.text', label);
          });
      });
    });
    // evenTags should not be visible
    cy.get('[data-qa-tag-header="LinodeTags"]').should('not.exist');

    // Toggle back to ungrouped view

    ui.button
      .findByAttribute('aria-label', 'Toggle group by tag')
      .should('be.visible')
      .click();

    // Confirm tooltip updates to "Group by tag"
    ui.tooltip.findByText('Group by tag').should('be.visible');
    // Ensure tag headers are no longer visible
    cy.get('[data-qa-tag-header="bothTags"]').should('not.exist');
    cy.get('[data-qa-tag-header="LinodeTags"]').should('not.exist');
    cy.get('[data-qa-tag-header="dbaasTags"]').should('not.exist');
    cy.get('[data-qa-tag-header="No Tags"]').should('not.exist');
  });
});
