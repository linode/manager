/**
 * @file Integration Tests for the CloudPulse Alerts Listing Page (Grouped by Tags).
 *
 * This spec verifies the grouping, display, and filtering behavior of alerts when grouped by tags.

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
const tagSequence = ['LinodeTags', 'DBaaSTags', 'bothTags', 'No Tags'];

// Generate mock alerts with a mix of tags, statuses, and service types
const mockAlerts = Array.from({ length: 5 }, (_, index): Alert => {
  const tag = tagSequence[index % tagSequence.length];
  const tags = tag === 'No Tags' ? [] : [tag, 'bothTags'];
  const status = statusList[index % statusList.length];
  const serviceType = serviceTypes[index % serviceTypes.length];
  const primaryTag = tags.length === 0 ? 'No Tags' : tags[0];
  const label = `${primaryTag}-${index}`;

  return alertFactory.build({
    created_by: primaryTag,
    label,
    service_type: serviceType,
    status,
    tags,
    type: 'user',
  });
});

// Categorize alerts based on tag combinations in a single pass
const categorizedAlerts = new Map();

mockAlerts.forEach((alert) => {
  const { tags } = alert;
  const hasLinode = tags.includes('LinodeTags');
  const hasDBaaS = tags.includes('DBaaSTags');

  const key =
    hasLinode && hasDBaaS
      ? 'bothTags'
      : hasLinode
        ? 'LinodeTags'
        : hasDBaaS
          ? 'DBaaSTags'
          : 'noTags';

  if (!categorizedAlerts.has(key)) {
    categorizedAlerts.set(key, []);
  }

  categorizedAlerts.get(key).push(alert);
});

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
    // Setup necessary mocks and feature flags
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetCloudPulseServices(serviceTypes);
    mockGetAllAlertDefinitions(mockAlerts).as('getAlertDefinitionsList');
    mockGetUserPreferences({ aclpAlertsGroupByTag: false });

    cy.visitWithLogin('/alerts/definitions');
    cy.wait('@getAlertDefinitionsList');

    // Enable grouping by tag
    ui.button.findByAttribute('aria-label', 'Toggle group by tag').click();

    // Validate table headers are visible
    ['label', 'status', 'service_type', 'created_by', 'updated'].forEach(
      (header) => {
        ui.heading.findByText(header).should('be.visible');
      }
    );

    // Ensure tooltip updates on grouping toggle
    ui.tooltip.findByText('Ungroup by tag').should('be.visible');

    // Confirm each tag group header is rendered
    tagSequence.forEach((tag) => {
      cy.get(`[data-qa-tag-header="${tag}"]`).should('have.text', tag);
    });

    // Validate all alerts are visible under correct tag groups
    cy.get('[data-qa="alert-table"]').within(() => {
      const allAlerts = Array.from(categorizedAlerts.values()).flat();
      allAlerts.forEach(({ label }) => {
        cy.findAllByLabelText(label)
          .should('exist')
          .should('be.visible')
          .each(($el) => cy.wrap($el).should('have.text', label));
      });
    });

    // Test filtering by alert label
    cy.findByPlaceholderText('Search for Alerts').type('DBaaSTags-1');

    // Only alerts from bothTags and DBaaSTags should match
    const expectedAlerts = [
      ...(categorizedAlerts.get('bothTags') || []),
      ...(categorizedAlerts.get('DBaaSTags') || []),
    ].filter(({ label }) => label.includes('DBaaSTags-1'));

    expectedAlerts.forEach(({ label }) => {
      cy.findAllByLabelText(label)
        .should('exist')
        .should('be.visible')
        .each(($el) => cy.wrap($el).should('have.text', label));
    });

    // Ensure alerts from unrelated tags are not shown
    const nonMatchingAlerts = [
      ...(categorizedAlerts.get('LinodeTags') || []),
      ...(categorizedAlerts.get('noTags') || []),
    ];

    nonMatchingAlerts.forEach(({ label }) => {
      cy.findAllByLabelText(label).should('not.exist');
    });

    // Clear search input
    cy.findByPlaceholderText('Search for Alerts').clear();

    // Filter by service type using dropdown
    cy.findByPlaceholderText('Select a Service').type('Databases{enter}');

    // Confirm filtered alerts remain grouped correctly
    const labelToTagsMap = {
      'DBaaSTags-1': [
        ...(categorizedAlerts.get('bothTags') || []),
        ...(categorizedAlerts.get('DBaaSTags') || []),
      ],
      'No Tags-3': [...(categorizedAlerts.get('noTags') || [])],
    };

    cy.get('[data-qa="alert-table"]').within(() => {
      Object.entries(labelToTagsMap).forEach(([label]) => {
        cy.findAllByLabelText(label)
          .should('be.visible')
          .each(($el) => cy.wrap($el).should('have.text', label));
      });
    });

    // Confirm that unrelated tag headers are not visible
    cy.get('[data-qa-tag-header="LinodeTags"]').should('not.exist');

    // Switch back to ungrouped view
    ui.button.findByAttribute('aria-label', 'Toggle group by tag').click();
    ui.tooltip.findByText('Group by tag').should('be.visible');

    // Verify that tag headers are no longer visible
    tagSequence.forEach((tag) => {
      cy.get(`[data-qa-tag-header="${tag}"]`).should('not.exist');
    });
  });
});
