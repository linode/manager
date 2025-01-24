/**
 * @file Integration Tests for the CloudPulse DBaaS Alerts Show Detail Page.
 * 
 * This file contains Cypress tests that validate the display and content of the DBaaS Alerts Show Detail Page in the CloudPulse application.
 * It ensures that all alert details, criteria, and resource information are displayed correctly.
 */
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  accountFactory,
  alertFactory,
  alertRulesFactory,
  regionFactory,
} from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import type { Flags } from 'src/featureFlags';

import {
  mockGetAlertDefinitions,
  mockGetAllAlertDefinitions,
} from 'support/intercepts/cloudpulse';
import { mockGetRegions } from 'support/intercepts/regions';
import { formatDate } from 'src/utilities/formatDate';
import {
  metricOperatorTypeMap,
  dimensionOperatorTypeMap,
  severityMap,
  aggregationTypeMap,
} from 'support/constants/alert';

const flags: Partial<Flags> = { aclp: { enabled: true, beta: true } };
const mockAccount = accountFactory.build();
const alertDetails = alertFactory.build({
  service_type: 'dbaas',
  severity: 1,
  status: 'enabled',
  type: 'system',
  entity_ids: ['1', '2'],
  rule_criteria: { rules: alertRulesFactory.buildList(2) },
});
const {
  service_type,
  severity,
  rule_criteria,
  id,
  label,
  description,
  created_by,
  updated,
} = alertDetails;
const { rules } = rule_criteria;
const regions = [
  regionFactory.build({
    capabilities: ['Managed Databases'],
    id: 'us-ord',
    label: 'Chicago, IL',
  }),
  regionFactory.build({
    capabilities: ['Managed Databases'],
    id: 'us-east',
    label: 'US, Newark',
  }),
];

/**
 * Integration tests for the CloudPulse DBaaS Alerts Detail Page, ensuring that the alert details, criteria, and resource information are correctly displayed and validated, including various fields like name, description, status, severity, and trigger conditions.
 */

describe('Integration Tests for Dbaas Alert Show Detail Page', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetRegions(regions);
    mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
    mockGetAlertDefinitions(service_type, id, alertDetails).as(
      'getDBaaSAlertDefinitions'
    );

    cy.visitWithLogin('/monitor/alerts/definitions');

    cy.wait('@getAlertDefinitionsList');

    cy.get(`[data-qa-alert-cell="${id}"]`).within(() => {
      // Ensure the alert label is visible
      cy.findByText(label).should('be.visible');

      // Action button within the alert cell should be visible and clickable
      cy.get(`[data-qa-alert-action-cell="alert_${id}"]`)
        .find('button')
        .should('be.visible')
        .click();
    });

    cy.get('[data-qa-action-menu-item="Show Details"]')
      .should('be.visible')
      .click();

    cy.wait(['@getDBaaSAlertDefinitions']);
  });

  it('should correctly display the details of the DBaaS alert in the alert details view', () => {
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

      cy.get('[data-qa-item="Severity"]').within(() => {
        cy.findByText('Severity:').should('be.visible');
        cy.findByText(severityMap[severity]).should('be.visible');
      });
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
              `[data-qa-chip="${aggregationTypeMap[rule.aggregation_type]}"]`
            )
              .should('be.visible')
              .should('have.text', aggregationTypeMap[rule.aggregation_type]);

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
        .should('have.text', '2 minutes');

      // Validating contents of Evaluation Periods
      cy.get('[data-qa-item="Evaluation Period"]')
        .find('[data-qa-chip]')
        .should('be.visible')
        .should('have.text', '4 minutes');

      // Validating contents of Trigger Alert
      cy.get('[data-qa-chip="All"]')
        .should('be.visible')
        .should('have.text', 'All');

      cy.get('[data-qa-chip="4 minutes"]')
        .should('be.visible')
        .should('have.text', '4 minutes');

      cy.get('[data-qa-item="criteria are met for"]')
        .should('be.visible')
        .should('have.text', 'criteria are met for');

      cy.get('[data-qa-item="consecutive occurrences"]')
        .should('be.visible')
        .should('have.text', 'consecutive occurrences.');
    });
  });
});
