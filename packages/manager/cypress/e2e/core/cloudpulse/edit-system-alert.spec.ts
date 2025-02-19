/**
 * @file Integration Tests for the CloudPulse Edit Alert Page.
 *
 * This file contains Cypress tests for the Edit Alert page of the CloudPulse application.
 * It ensures that users can navigate to the Edit Alert Page and that alerts are correctly displayed and interactive on the Edit page.
 */
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  accountFactory,
  alertFactory,
  databaseFactory,
  regionFactory,
} from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import type { Flags } from 'src/featureFlags';
import {
  mockGetAlertDefinitions,
  mockGetAllAlertDefinitions,
  mockUpdateAlertDefinitions,
} from 'support/intercepts/cloudpulse';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { Alert, Database } from '@linode/api-v4';
import { mockGetDatabases } from 'support/intercepts/databases';

const flags: Partial<Flags> = { aclp: { enabled: true, beta: true } };

const expectedResourceIds = Array.from({ length: 50 }, (_, i) => String(i + 1));
const mockAccount = accountFactory.build();
const alertDetails = alertFactory.build({
  label: 'Alert-1',
  description: 'Test description',
  service_type: 'dbaas',
  severity: 1,
  status: 'enabled',
  type: 'system',
});
const { service_type, id, label } = alertDetails;
const regions = [
  regionFactory.build({
    capabilities: ['Managed Databases'],
    id: 'us-ord',
    label: 'Chicago, IL',
  }),
  regionFactory.build({
    capabilities: ['Managed Databases'],
    id: 'us-east',
    label: 'Newark',
  }),
];
const databases: Database[] = databaseFactory
  .buildList(50)
  .map((db, index) => ({
    ...db,
    type: 'MySQL',
    region: regions[index % regions.length].id,
    status: 'active',
    engine: 'mysql',
  }));
const pages = [1, 2];

describe('Integration Tests for Edit Alert', () => {
  /*
 * - Confirms navigation from the Alert Definitions List page to the Edit Alert page.
 * - Confirms alert creation is successful using mock API data.
 * - Confirms that UI handles API interactions and displays correct data.
 * - Confirms that UI redirects back to the Alert Definitions List page after saving updates.
 * - Confirms that a toast notification appears upon successful alert update.
 * - Confirms that UI redirects to the alert listing page after creating an alert.
 * - Confirms that after submitting, the data matches with the API response.
 */
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetRegions(regions);
    mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
    mockGetAlertDefinitions(service_type, id, alertDetails).as(
      'getAlertDefinitions'
    );
    mockGetDatabases(databases).as('getDatabases');
    mockUpdateAlertDefinitions(service_type, id, alertDetails).as(
      'updateDefinitions'
    );
  });

  it('should navigate from the Alert Definitions List page to the Edit Alert page', () => {
    // Navigate to the alert definitions list page with login
    cy.visitWithLogin('/monitor/alerts/definitions');

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

    // Select the "Edit" option from the action menu
    ui.actionMenuItem.findByTitle('Edit').should('be.visible').click();

    // Verify the URL ends with the expected details page path
    cy.url().should('endWith', `/edit/${service_type}/${id}`);
  });

  it('should correctly display and update the details of the alert in the edit alert page', () => {
    // Navigate to the Edit Alert page
    cy.visitWithLogin(`/monitor/alerts/definitions/edit/${service_type}/${id}`);

    cy.wait(['@getAlertDefinitions', '@getDatabases']);

    // Verify that the heading with text 'resource' is visible
    ui.heading.findByText('resource').should('be.visible');

    // Verify that the heading with text 'region' is visible
    ui.heading.findByText('region').should('be.visible');

    // Verify the initial selection of resources
    cy.get('[data-qa-notice="true"]').should(
      'contain.text',
      '3 of 50 resources are selected'
    );
    // Select all resources
    cy.get('[data-qa-notice="true"]').within(() => {
      ui.button
        .findByTitle('Select All')
        .should('be.visible')
        .click();

      // Unselect button should be visible after clicking on Select All button
      ui.button
        .findByTitle('Unselect All')
        .should('be.visible')
        .should('be.enabled');
    });

    cy.get('[data-qa-notice="true"]').should(
      'contain.text',
      '50 of 50 resources are selected'
    );

    // Verify the initial state of the page size
    ui.pagination.findPageSizeSelect().click();

    // Verify the page size options are visible
    cy.get('[data-qa-pagination-page-size-option="25"]')
      .should('exist')
      .click();

    // Confirm that pagination controls list exactly 4 pages.
    ui.pagination
      .findControls()
      .should('be.visible')
      .within(() => {
        pages.forEach((page: number) =>
          cy.findByText(`${page}`).should('be.visible')
        );
        cy.findByText('5').should('not.exist');
      });

    // Click through each page and confirm correct invoice items are displayed.
    pages.forEach((page: number) => {
      databases.slice(25 * (page - 1), 25 * (page - 1) + 24);

      ui.pagination.findControls().within(() => {
        cy.findByText(`${page}`).should('be.visible').click();
      });
    });
    // Change pagination size selection from "Show 25" to "Show 100".
    ui.pagination.findPageSizeSelect().click();
    cy.get('[data-qa-pagination-page-size-option="100"]')
      .should('exist')
      .click();
    // Confirm that all invoice items are listed.
    cy.get('tr').should('have.length', 51);
    databases.forEach((databaseItem: Database) => {
      cy.findByText(databaseItem.label).should('be.visible');
    });

    // Click the Save button
    ui.buttonGroup
      .findButtonByTitle('Save')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Click the Cancel button
    cy.get('[data-qa-cancel="true"]').should('be.enabled').should('be.visible');

    // Click the Confirm button
    cy.get('[data-qa-edit-confirmation="true"]')
      .filter('[label="Confirm"]')
      .should('be.visible')
      .click();

    cy.wait('@updateDefinitions').then(({ request, response }) => {
      const {
        type,
        status,
        severity,
        description,
        created_by,
        updated_by,
      } = alertDetails;

      expect(response).to.have.property('statusCode', 200);

      const resourceIds: string[] = request.body.entity_ids.map((id: number) =>
        String(id)
      );

      expect(resourceIds.join(',')).to.equal(expectedResourceIds.join(','));

      const alertResponse: Alert = response?.body;

      // Destructure alert_channels and trigger_conditions from alertResponse
      const {
        alert_channels,
        trigger_conditions: responseTriggerConditions,
        tags,
      } = alertResponse;
      const {
        criteria_condition: responseCriteriaCondition,
        evaluation_period_seconds: responseEvaluationPeriod,
        polling_interval_seconds: responsePollingInterval,
        trigger_occurrences: responseTriggerOccurrences,
      } = responseTriggerConditions;

      // Validate basic properties
      expect(alertResponse).to.have.property('id', id);
      expect(alertResponse).to.have.property('label', label);
      expect(alertResponse).to.have.property('type', type);
      expect(alertResponse).to.have.property('status', status);
      expect(alertResponse).to.have.property('service_type', service_type);
      expect(alertResponse).to.have.property('severity', severity);
      expect(alertResponse).to.have.property('description', description);
      expect(alertResponse).to.have.property('created_by', created_by);
      expect(alertResponse).to.have.property('updated_by', updated_by);

      // Validate alert channels
      expect(alert_channels).to.be.an('array').that.has.length(2);
      expect(alert_channels[0]).to.have.property('id', 1);
      expect(alert_channels[0]).to.have.property('label', 'sample1');
      expect(alert_channels[0]).to.have.property('type', 'alert-channel');
      expect(alert_channels[1]).to.have.property('id', 2);
      expect(alert_channels[1]).to.have.property('label', 'sample2');
      expect(alert_channels[1]).to.have.property('type', 'alert-channel');

      // Validate rule criteria
      expect(alertResponse.rule_criteria).to.have.property('rules');

      // Validate trigger conditions
      expect(responseTriggerConditions).to.have.property(
        'criteria_condition',
        responseCriteriaCondition
      );
      expect(responseTriggerConditions).to.have.property(
        'evaluation_period_seconds',
        responseEvaluationPeriod
      );
      expect(responseTriggerConditions).to.have.property(
        'polling_interval_seconds',
        responsePollingInterval
      );
      expect(responseTriggerConditions).to.have.property(
        'trigger_occurrences',
        responseTriggerOccurrences
      );

      // Validate tags
      expect(tags).to.include('tag1');
      expect(tags).to.include('tag2');

      // Validate navigation
      cy.url().should('endWith', '/monitor/alerts/definitions');

      // Confirm toast notification appears
      ui.toast.assertMessage('Alert resources successfully updated.');
    });
  });
});
