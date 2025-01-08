/**
 * @file Integration Tests for the CloudPulse DBaaS Alerts Detail Page.
 *
 */
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  accountFactory,
  alertFactory,
  databaseFactory,
  linodeFactory,
  regionFactory,
} from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import type { Flags } from 'src/featureFlags';

import {
  mockGetAlertDefinitions,
  mockGetAllAlertDefinitions,
} from 'support/intercepts/cloudpulse';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetDatabases } from 'support/intercepts/databases';
import { Database } from '@linode/api-v4';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { formatDate } from 'src/utilities/formatDate';

const flags: Partial<Flags> = { aclp: { enabled: true, beta: true } };

const mockAccount = accountFactory.build();
const mockDBaaSAlertDetails = alertFactory.build({
  id: 1001,
  created_by: 'user1',
  service_type: 'dbaas',
  severity: 1,
  status: 'enabled',
  type: 'system',
  updated_by: 'user1',
  entity_ids: ['1', '2'],
});
const mockLinodeAlertDetails = alertFactory.build({
  id: 1002,
  created_by: 'user1',
  service_type: 'linode',
  severity: 1,
  status: 'disabled',
  type: 'system',
  updated_by: 'user1',
  entity_ids: ['3'],
});

const mockDBaaSRegion = regionFactory.build({
  capabilities: ['Managed Databases'],
  id: 'us-ord',
  label: 'Chicago, IL',
});

const mockLinodeRegion = regionFactory.build({
  capabilities: ['Linodes'],
  id: 'us-east',
  label: 'US, Newark',
});

const databaseMock: Database = databaseFactory.build({
  label: 'alert-resource-1',
  id: 1,
  type: 'MySQL',
  region: mockDBaaSRegion.label,
  version: '1',
  status: 'active',
  cluster_size: 1,
  engine: 'mysql',
});
const extendedDatabaseMock: Database = databaseFactory.build({
  label: 'alert-resource-2',
  id: 2,
  type: 'MySQL',
  region: mockDBaaSRegion.label,
  version: '1',
  status: 'active',
  cluster_size: 1,
  engine: 'mysql',
});
const mockLinode = linodeFactory.build({
  tags: ['tag-2', 'tag-3'],
  label: 'alert-resource-3',
  id: 3,
});

/**
 * Integration tests for the CloudPulse DBaaS Alerts Detail Page, ensuring that the alert details, criteria, and resource information are correctly displayed and validated, including various fields like name, description, status, severity, and trigger conditions.
 */

describe('Integration Tests for Dbaas Alert Show Detail Page', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetRegions([mockDBaaSRegion, mockLinodeRegion]);
    mockGetAllAlertDefinitions([
      mockDBaaSAlertDetails,
      mockLinodeAlertDetails,
    ]).as('getAlertDefinitionsList');
    mockGetDatabases([databaseMock, extendedDatabaseMock]).as(
      'getMockedDbaasDatabases'
    );
    mockGetLinodes([mockLinode]).as('getLiodeDatabase');
    mockGetAlertDefinitions(
      mockDBaaSAlertDetails.service_type,
      mockDBaaSAlertDetails.id,
      mockDBaaSAlertDetails
    ).as('getDBaaSAlertDefinitions');
    mockGetAlertDefinitions(
      mockLinodeAlertDetails.service_type,
      mockLinodeAlertDetails.id,
      mockLinodeAlertDetails
    ).as('getLinodeAlertDefinitions');
    cy.visitWithLogin('/monitor/alerts/definitions');

    cy.wait('@getAlertDefinitionsList');

    cy.get(`[data-qa-alert-cell="${mockDBaaSAlertDetails.id}"]`).within(() => {
      // Ensure the alert label is visible
      cy.findByText(mockDBaaSAlertDetails.label).should('be.visible');

      // Action button within the alert cell should be visible and clickable
      cy.get(`[data-qa-alert-action-cell="alert_${mockDBaaSAlertDetails.id}"]`)
        .find('button')
        .should('be.visible')
        .click();
    });

    cy.get('[data-qa-action-menu-item="Show Details"]')
      .should('be.visible')
      .click();

    cy.wait(['@getDBaaSAlertDefinitions', '@getMockedDbaasDatabases']);
  });

  it('should correctly display the details of the DBaaS alert in the alert details view', () => {
    // Validating contents of Overview Section
    cy.get('[data-qa-section="Overview"]').within(() => {
      // Validate Name field
      cy.get('[data-qa-item="Name"]').within(() => {
        cy.findByText('Name:').should('be.visible');
        cy.findByText(mockDBaaSAlertDetails.label).should('be.visible');
      });
      // Validate Description field
      cy.get('[data-qa-item="Description"]').within(() => {
        cy.findByText('Description:').should('be.visible');
        cy.findByText(mockDBaaSAlertDetails.description).should('be.visible');
      });

      // Validate Status field
      cy.get('[data-qa-item="Status"]').within(() => {
        cy.findByText('Status:').should('be.visible');
        cy.findByText(
          mockDBaaSAlertDetails.status.replace('enabled', 'Enabled')
        ).should('be.visible');
      });

      cy.get('[data-qa-item="Severity"]').within(() => {
        cy.findByText('Severity:').should('be.visible');
        cy.findByText(
          String(mockDBaaSAlertDetails.severity).replace('1', 'Medium')
        ).should('be.visible');
      });
      // Validate Service field
      cy.get('[data-qa-item="Service"]').within(() => {
        cy.findByText('Service:').should('be.visible');
        cy.findByText(
          mockDBaaSAlertDetails.service_type.replace('dbaas', 'Databases')
        ).should('be.visible');
      });

      // Validate Type field
      cy.get('[data-qa-item="Type"]').within(() => {
        cy.findByText('Type:').should('be.visible');

        cy.findByText(
          mockDBaaSAlertDetails.type.replace('system', 'System')
        ).should('be.visible');
      });

      // Validate Created By field
      cy.get('[data-qa-item="Created By"]').within(() => {
        cy.findByText('Created By:').should('be.visible');

        cy.findByText(mockDBaaSAlertDetails.created_by).should('be.visible');
      });

      // Validate Last Modified field
      cy.get('[data-qa-item="Last Modified"]').within(() => {
        cy.findByText('Last Modified:').should('be.visible');
        cy.findByText( formatDate(mockDBaaSAlertDetails.updated, {format: 'MMM dd, yyyy, h:mm a', }))
        .should('be.visible');
      });
    });

    // Validating contents of Criteria Section
    cy.get('[data-qa-section="Criteria"]').within(() => {
      mockDBaaSAlertDetails.rule_criteria.rules.forEach((rule, index) => {
        cy.get('[data-qa-item="Metric Threshold"]')
          .eq(index)
          .within(() => {
            cy.get( `[data-qa-chip="${rule.aggregation_type.replace('avg', 'Average')}"]`)
              .should('be.visible')
              .should( 'have.text',rule.aggregation_type.replace('avg', 'Average'));

            cy.get(`[data-qa-chip="${rule.metric}"]`)
              .should('be.visible')
              .should('have.text', rule.metric);

            cy.get(`[data-qa-chip="${rule.operator.replace('gt', '>')}"]`)
              .should('be.visible')
              .should('have.text', rule.operator.replace('gt', '>'));

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
              cy.get(`[data-qa-chip="${filter.operator}"]`)
                .should('be.visible')
                .each(($chip) => {
                  expect($chip).to.have.text(filter.operator);
                });
              // Validate the filter value
              cy.get(`[data-qa-chip="${filter.value}"]`)
                .should('be.visible')
                .each(($chip) => {
                  expect($chip).to.have.text(filter.value);
                });
            });
          });
      });

      // Validating contents of Polling Interval
      cy.get('[data-qa-item="Polling Interval"]')
        .find('[data-qa-chip]')
        .should('be.visible')
        .should('have.text',String(mockDBaaSAlertDetails.trigger_conditions.polling_interval_seconds)
        .replace('120', '2 minutes') );

      // Validating contents of Evaluation Periods
      cy.get('[data-qa-item="Evaluation Periods"]')
        .find('[data-qa-chip]')
        .should('be.visible')
        .should( 'have.text',String(mockDBaaSAlertDetails.trigger_conditions.evaluation_period_seconds)
            .replace('240', '4 minutes'));

      cy.get(`[data-qa-chip="${mockDBaaSAlertDetails.trigger_conditions.criteria_condition
        .replace('ALL','All' )}"]`)
        .should('be.visible')
        .should('have.text', mockDBaaSAlertDetails.trigger_conditions.criteria_condition.
          replace('ALL','All' ));

      cy.get( `[data-qa-chip="${String( mockDBaaSAlertDetails.trigger_conditions.evaluation_period_seconds)
        .replace('240', '4 minutes')}"]`)
        .should('be.visible')
        .should('have.text',
          String(mockDBaaSAlertDetails.trigger_conditions.evaluation_period_seconds)
          .replace('240', '4 minutes'));

      cy.get('[data-qa-item="criteria are met for"]').should('be.visible');

      cy.get('[data-qa-item="consecutive occurrences"]').should('be.visible');
    });

    cy.get('[data-qa-section="Resources"]').within(() => {
      // Assert headers are visible and have the correct text
      cy.get('[data-qa-header="resource"]')
        .scrollIntoView()
        .should('be.visible')
        .should('have.text', 'Resource');

      cy.get('[data-qa-header="region"]')
        .should('be.visible')
        .should('have.text', 'Region');

      // Assert the placeholder values for input fields
      cy.findByPlaceholderText('Search for a Resource').should('be.visible');
      cy.findByPlaceholderText('Select Regions').should('be.visible');

      // Assert the number of rows in the table
      cy.get('[data-qa-alert-row]').should('have.length', 2);

      // Assert specific table cell values for databaseMock
      cy.get(`[data-qa-alert-cell="${databaseMock.id}_resource"]`)
        .should('be.visible')
        .should('have.text', databaseMock.label);

      cy.get(`[data-qa-alert-cell="${databaseMock.id}_region"]`)
        .should('be.visible')
        .should('have.text', mockDBaaSRegion.label);

      // Assert specific table cell values for extendedDatabaseMock
      cy.get(`[data-qa-alert-cell="${extendedDatabaseMock.id}_resource"]`)
        .should('be.visible')
        .should('have.text', extendedDatabaseMock.label);

      cy.get(`[data-qa-alert-cell="${extendedDatabaseMock.id}_region"]`)
        .should('be.visible')
        .should('have.text', mockDBaaSRegion.label);

      //Click on the 'resource' column header to sort the resources in ascending order
      cy.get('[data-qa-header="resource"]').should('be.visible').click();

      // Get all rows with the attribute data-qa-alert-row
      cy.get('[data-qa-alert-row]').then(($rows) => {
        const alertRowIds = $rows
          .map((index, row) => row.getAttribute('data-qa-alert-row'))
          .get();
        expect(alertRowIds).to.deep.equal(['2', '1']);
      });

      //Click on the 'resource' column header to sort the resources in descending order
      cy.get('[data-qa-header="resource"]').should('be.visible').click();

      // Get all rows with the attribute data-qa-alert-row
      cy.get('[data-qa-alert-row]').then(($rows) => {
        const alertRowIds = $rows
          .map((index, row) => row.getAttribute('data-qa-alert-row'))
          .get();
        expect(alertRowIds).to.deep.equal(['1', '2']);
      });
    });
  });
});
