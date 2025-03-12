/**
 * @file Integration Tests for the CloudPulse Alerts Show Detail Page.
 *
 * This file contains Cypress tests that validate the display and content of the  Alerts Show Detail Page in the CloudPulse application.
 * It ensures that all alert details, criteria, and resource information are displayed correctly.
 */
import { capitalize } from '@linode/utilities';
import {
  aggregationTypeMap,
  dimensionOperatorTypeMap,
  metricOperatorTypeMap,
  severityMap,
} from 'support/constants/alert';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetAlertChannels,
  mockGetAlertDefinitions,
  mockGetAllAlertDefinitions,
} from 'support/intercepts/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';

import {
  accountFactory,
  alertFactory,
  alertRulesFactory,
  databaseFactory,
  notificationChannelFactory,
  regionFactory,
} from 'src/factories';
import { formatDate } from 'src/utilities/formatDate';

import type { Database } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

const flags: Partial<Flags> = { aclp: { beta: true, enabled: true } };
const mockAccount = accountFactory.build();
const regions = [
  regionFactory.build({
    capabilities: ['Managed Databases'],
    country: 'us',
    id: 'us-ord',
    label: 'Chicago, IL',
  }),
  regionFactory.build({
    capabilities: ['Managed Databases'],
    country: 'us',
    id: 'us-east',
    label: 'Newark',
  }),
];

const databases: Database[] = databaseFactory.buildList(5).map((db, index) => ({
  ...db,
  engine: 'mysql',
  region: regions[index % regions.length].id,
  type: 'MySQL',
}));

const alertDetails = alertFactory.build({
  entity_ids: databases.slice(0, 4).map((db) => db.id.toString()),
  rule_criteria: { rules: alertRulesFactory.buildList(2) },
  service_type: 'dbaas',
  severity: 1,
  status: 'enabled',
  type: 'system',
});
const {
  created_by,
  description,
  id,
  label,
  rule_criteria,
  service_type,
  severity,
  updated,
} = alertDetails;
const { rules } = rule_criteria;
const notificationChannels = notificationChannelFactory.build();

const verifyRowOrder = (expectedIds: string[]) => {
  cy.get('[data-qa-alert-row]').then(($rows) => {
    const alertRowIds = $rows
      .map((index, row) => row.getAttribute('data-qa-alert-row'))
      .get();
    expectedIds.forEach((expectedId, index) => {
      expect(alertRowIds[index]).to.equal(expectedId);
    });
  });
};
/**
 * Integration tests for the CloudPulse Alerts Detail Page, ensuring that the alert details, criteria, and resource information are correctly displayed and validated, including various fields like name, description, status, severity, and trigger conditions.
 */

describe('Integration Tests for Alert Show Detail Page', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetRegions(regions);
    mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
    mockGetAlertDefinitions(service_type, id, alertDetails).as(
      'getDBaaSAlertDefinitions'
    );
    mockGetDatabases(databases).as('getMockedDbaasDatabases');
    mockGetAlertChannels([notificationChannels]);
  });

  it('navigates to the Show Details page from the list page', () => {
    // Navigate to the alert definitions list page with login
    cy.visitWithLogin('/alerts/definitions');

    // Wait for the alert definitions list API call to complete
    cy.wait('@getAlertDefinitionsList');

    // Locate the alert with the specified label in the table
    cy.findByText(label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.actionMenu
          .findByTitle(`Action menu for Alert ${label}`)
          .should('be.visible')
          .click();
      });

    // Select the "Show Details" option from the action menu
    ui.actionMenuItem.findByTitle('Show Details').should('be.visible').click();

    // Verify the URL ends with the expected details page path
    cy.url().should('endWith', `/detail/${service_type}/${id}`);
  });

  it('should correctly display the details of the DBaaS alert in the alert details view', () => {
    cy.visitWithLogin(
      `/alerts/definitions/detail/${service_type}/${id}`
    );
    cy.wait(['@getDBaaSAlertDefinitions', '@getMockedDbaasDatabases']);

    // Validating contents of Overview Section
    cy.get('[data-qa-section="Overview"]').within(() => {
      // Validate Name field
      cy.findByText('Name:').should('be.visible');
      cy.findByText(label).should('be.visible');

      // Validate Description field
      cy.findByText('Description:').should('be.visible');
      cy.findByText(description).should('be.visible');

      // Validate Status field
      cy.findByText('Status:').should('be.visible');
      cy.findByText('Enabled').should('be.visible');

      cy.findByText('Severity:').should('be.visible');
      cy.findByText(severityMap[severity]).should('be.visible');

      // Validate Service field
      cy.findByText('Service:').should('be.visible');
      cy.findByText('Databases').should('be.visible');

      // Validate Type field
      cy.findByText('Type:').should('be.visible');
      cy.findByText('System').should('be.visible');

      // Validate Created By field
      cy.findByText('Created By:').should('be.visible');
      cy.findByText(created_by).should('be.visible');

      // Validate Last Modified field
      cy.findByText('Last Modified:').should('be.visible');
      cy.findByText(
        formatDate(updated, {
          format: 'MMM dd, yyyy, h:mm a',
        })
      ).should('be.visible');
    });

    // Validating contents of Criteria Section
    cy.get('[data-qa-section="Criteria"]').within(() => {
      rules.forEach((rule, index) => {
        cy.get('[data-qa-item="Metric Threshold"]')
          .eq(index)
          .within(() => {
            cy.get(
              `[data-qa-chip="${aggregationTypeMap[rule.aggregate_function]}"]`
            )
              .should('be.visible')
              .should('have.text', aggregationTypeMap[rule.aggregate_function]);

            cy.get(`[data-qa-chip="${rule.label}"]`)
              .should('be.visible')
              .should('have.text', rule.label);

            cy.get(`[data-qa-chip="${metricOperatorTypeMap[rule.operator]}"]`)
              .should('be.visible')
              .should('have.text', metricOperatorTypeMap[rule.operator]);

            cy.get(`[data-qa-chip="${rule.threshold}"]`)
              .should('be.visible')
              .should('have.text', rule.threshold);

            cy.get(`[data-qa-chip="${rule.unit}"]`)
              .should('be.visible')
              .should('have.text', rule.unit);
          });

        // Validating contents of Dimension Filter
        cy.get('[data-qa-item="Dimension Filter"]')
          .eq(index)
          .within(() => {
            (rule.dimension_filters ?? []).forEach((filter, filterIndex) => {
              // Validate the filter label
              cy.get(`[data-qa-chip="${filter.label}"]`)
                .should('be.visible')
                .each(($chip) => {
                  expect($chip).to.have.text(filter.label);
                });
              // Validate the filter operator
              cy.get(
                `[data-qa-chip="${dimensionOperatorTypeMap[filter.operator]}"]`
              )
                .should('be.visible')
                .each(($chip) => {
                  expect($chip).to.have.text(
                    dimensionOperatorTypeMap[filter.operator]
                  );
                });
              // Validate the filter value
              cy.get(`[data-qa-chip="${capitalize(filter.value)}"]`)
                .should('be.visible')
                .each(($chip) => {
                  expect($chip).to.have.text(capitalize(filter.value));
                });
            });
          });
      });

      // Validating contents of Polling Interval
      cy.get('[data-qa-item="Polling Interval"]')
        .find('[data-qa-chip]')
        .should('be.visible')
        .should('have.text', '10 minutes');

      // Validating contents of Evaluation Periods
      cy.get('[data-qa-item="Evaluation Period"]')
        .find('[data-qa-chip]')
        .should('be.visible')
        .should('have.text', '5 minutes');

      // Validating contents of Trigger Alert
      cy.get('[data-qa-chip="All"]')
        .should('be.visible')
        .should('have.text', 'All');

      cy.get('[data-qa-chip="5 minutes"]')
        .should('be.visible')
        .should('have.text', '5 minutes');

      cy.get('[data-qa-item="criteria are met for"]')
        .should('be.visible')
        .should('have.text', 'criteria are met for');

      cy.get('[data-qa-item="consecutive occurrences"]')
        .should('be.visible')
        .should('have.text', 'consecutive occurrences.');
    });
    //  Validate the Resources section (Resource and Region columns)
    cy.get('[data-qa-section="Resources"]').within(() => {
      ui.heading
        .findByText('resource')
        .scrollIntoView()
        .should('be.visible')
        .should('have.text', 'Resource');

      ui.heading
        .findByText('region')
        .should('be.visible')
        .should('have.text', 'Region');

      cy.findByPlaceholderText('Search for a Region or Resource').should(
        'be.visible'
      );

      cy.findByPlaceholderText('Select Regions').should('be.visible');

      cy.get('[data-qa-alert-row]').should('have.length', 4);

      // Validate resource-region mapping for each row in the table

      const regionMap = new Map(regions.map((r) => [r.id, r.label]));

      cy.get('[data-qa-alert-row]')
        .should('have.length', 4)
        .each((row, index) => {
          const db = databases[index];
          const rowNumber = index + 1;
          const regionLabel = regionMap.get(db.region) || 'Unknown Region';

          cy.wrap(row).within(() => {
            cy.get(`[data-qa-alert-cell="${rowNumber}_resource"]`).should(
              'have.text',
              db.label
            );

            cy.get(`[data-qa-alert-cell="${rowNumber}_region"]`).should(
              'have.text',
              `US, ${regionLabel} (${db.region})`
            );
          });
        });

      // Sorting by Resource and Region columns
      ui.heading.findByText('resource').should('be.visible').click();
      verifyRowOrder(['4', '3', '2', '1']);

      ui.heading.findByText('resource').should('be.visible').click();
      verifyRowOrder(['1', '2', '3', '4']);

      ui.heading.findByText('region').should('be.visible').click();
      verifyRowOrder(['2', '4', '1', '3']);

      ui.heading.findByText('region').should('be.visible').click();
      verifyRowOrder(['1', '3', '2', '4']);

      // Search by Resource
      cy.findByPlaceholderText('Search for a Region or Resource')
        .should('be.visible')
        .type(databases[0].label);

      cy.get('[data-qa-alert-table="true"]')
        .find('[data-qa-alert-row]')
        .should('have.length', 1);

      cy.findByText(databases[0].label).should('be.visible');
      [1, 2, 3].forEach((i) =>
        cy.findByText(databases[i].label).should('not.exist')
      );

      // Search by region
      cy.findByPlaceholderText('Search for a Region or Resource').clear();

      ui.regionSelect.find().click().type(`${regions[0].label}{enter}`);
      ui.regionSelect.find().click();

      cy.get('[data-qa-alert-table="true"]')
        .find('[data-qa-alert-row]')
        .should('have.length', 2);

      [0, 2].forEach((i) =>
        cy.get(`[data-qa-alert-cell="${i}_region"]`).should('not.exist')
      );
      [1, 3].forEach((i) =>
        cy.get(`[data-qa-alert-cell="${i}_region"]`).should('be.visible')
      );
    });
    // Validate Notification Channels Section
    cy.get('[data-qa-section="Notification Channels"]').within(() => {
      cy.findByText('Type:').should('be.visible');
      cy.findByText('Email').should('be.visible');
      cy.findByText('Channel:').should('be.visible');
      cy.findByText('Channel-1').should('be.visible');
      cy.findByText('To:').should('be.visible');
      cy.findByText('test@test.com').should('be.visible');
      cy.findByText('test2@test.com').should('be.visible');
    });
  });
});
