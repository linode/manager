/**
 * @file Integration Tests for the CloudPulse Edit Alert Page.
 *
 * This file contains Cypress tests for the Edit Alert page of the CloudPulse application.
 * It ensures that users can navigate to the Edit Alert Page and that alerts are correctly displayed and interactive on the Edit page.
 */
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetAlertDefinitions,
  mockGetAllAlertDefinitions,
  mockUpdateAlertDefinitions,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetFirewalls } from 'support/intercepts/firewalls';
import { ui } from 'support/ui';

import {
  accountFactory,
  alertFactory,
  firewallFactory,
  firewallMetricRulesFactory,
  firewallNodebalancerMetricCriteria,
  flagsFactory,
} from 'src/factories';

import type { Alert } from '@linode/api-v4';

const mockAccount = accountFactory.build();
const mockFirewalls = [
  firewallFactory.build({
    id: 1,
    label: 'firewall-linode-1',
    status: 'enabled',
    entities: [
      {
        id: 1,
        label: 'linode-1',
        type: 'linode',
        url: '/test',
        parent_entity: null,
      },
    ],
  }),
  firewallFactory.build({
    id: 2,
    label: 'firewall-linode_interface-2',
    status: 'enabled',
    entities: [
      {
        id: 2,
        label: 'linode_interface-2',
        type: 'linode_interface',
        url: '/test',
        parent_entity: {
          id: 1,
          label: 'linode-1',
          type: 'linode',
          url: '/parent-test',
          parent_entity: null,
        },
      },
    ],
  }),
  firewallFactory.build({
    id: 3,
    label: 'firewall-no-entities-3',
    status: 'enabled',
    entities: [],
  }),
  firewallFactory.build({
    id: 4,
    label: 'firewall-nodebalancer-4',
    status: 'enabled',
    entities: [
      {
        id: 4,
        label: 'nodebalancer-4',
        type: 'nodebalancer',
        url: '/test',
        parent_entity: null,
      },
    ],
  }),
  firewallFactory.build({
    id: 5,
    label: 'firewall-nodebalancer-5',
    status: 'enabled',
    entities: [
      {
        id: 5,
        label: 'nodebalancer-4',
        type: 'nodebalancer',
        url: '/test',
        parent_entity: null,
      },
    ],
  }),
];

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
    mockAppendFeatureFlags(flagsFactory.build());
    mockGetAccount(mockAccount);
    mockGetFirewalls(mockFirewalls);
  });

  it('displays and updates firewall alert details for Linode entities', () => {
    // Navigate to the Edit Alert page
    const alertDetails = alertFactory.build({
      description: 'Test description',
      entity_ids: ['1', '2', '3'],
      label: 'Alert-1',
      service_type: 'firewall',
      severity: 1,
      status: 'enabled',
      type: 'system',
      rule_criteria: {
        rules: [firewallMetricRulesFactory.build()],
      },
    });

    const { id, label, service_type } = alertDetails;
    mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
    mockGetAlertDefinitions(service_type, id, alertDetails).as(
      'getAlertDefinitions'
    );
    mockUpdateAlertDefinitions(service_type, id, alertDetails).as(
      'updateDefinitions'
    );
    cy.visitWithLogin(`/alerts/definitions/edit/${service_type}/${id}`);

    cy.wait('@getAlertDefinitions');

    // Verify that the heading with text 'entity' is visible
    ui.heading.findByText('entity').should('be.visible');

    // Verify the initial selection of entities, then select all entities.
    cy.findByText('2 of 2 entities are selected.')
      .should('be.visible')
      .closest('[data-qa-notice]')
      .within(() => {
        ui.button.findByTitle('Deselect All').should('be.visible').click();

        ui.button
          .findByTitle('Select All')
          .should('be.visible')
          .should('be.enabled');
      });

    // Confirm notice text updates to reflect selection.
    cy.findByText('0 of 2 entities are selected.').should('be.visible');

    // Confirm that all invoice items are listed.
    cy.get('tr').should('have.length', 3);

    cy.get('[data-qa-alert-table-body="true"]').within(() => {
      cy.get('[data-qa-alert-cell$="_entity"]').then(($cells) => {
        expect(
          $cells.toArray().map((cell) => cell.innerText.trim())
        ).to.deep.equal(['firewall-linode-1', 'firewall-linode_interface-2']);
      });
      cy.get('input[type="checkbox"]')
        .should('have.length', 2)
        .and('not.be.checked');
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
      const { created_by, description, severity, status, type, updated_by } =
        alertDetails;

      const resourceIds: string[] = request.body.entity_ids.map((id: number) =>
        String(id)
      );

      expect(resourceIds).to.be.empty;
      const alertResponse: Alert = response?.body;

      // Destructure alert_channels and trigger_conditions from alertResponse
      const {
        alert_channels,
        tags,
        trigger_conditions: responseTriggerConditions,
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
      cy.url().should('endWith', '/alerts/definitions');

      // Confirm toast notification appears
      ui.toast.assertMessage('Alert entities successfully updated.');
    });
  });
  it('displays and updates firewall alert details for Nodebalancer entities', () => {
    // Navigate to the Edit Alert page
    const alertDetails = alertFactory.build({
      description: 'Test description',
      entity_ids: [],
      label: 'Alert-1',
      service_type: 'firewall',
      severity: 1,
      status: 'enabled',
      type: 'system',
      rule_criteria: {
        rules: [firewallNodebalancerMetricCriteria.build()],
      },
    });

    const { id, label, service_type } = alertDetails;
    mockGetAllAlertDefinitions([alertDetails]).as('getAlertDefinitionsList');
    mockGetAlertDefinitions(service_type, id, alertDetails).as(
      'getAlertDefinitions'
    );
    mockUpdateAlertDefinitions(service_type, id, alertDetails).as(
      'updateDefinitions'
    );
    cy.visitWithLogin(`/alerts/definitions/edit/${service_type}/${id}`);

    cy.wait('@getAlertDefinitions');

    // Verify that the heading with text 'entity' is visible
    ui.heading.findByText('entity').should('be.visible');

    // Verify the initial selection of entities, then select all entities.
    cy.findByText('0 of 2 entities are selected.')
      .should('be.visible')
      .closest('[data-qa-notice]')
      .within(() => {
        ui.button.findByTitle('Select All').should('be.visible').click();

        ui.button
          .findByTitle('Deselect All')
          .should('be.visible')
          .should('be.enabled');
      });

    // Confirm notice text updates to reflect selection.
    cy.findByText('2 of 2 entities are selected.').should('be.visible');

    // Confirm that all invoice items are listed.
    cy.get('tr').should('have.length', 3);

    cy.get('[data-qa-alert-table-body="true"]').within(() => {
      cy.get('[data-qa-alert-cell$="_entity"]').then(($cells) => {
        expect($cells.toArray().map((el) => el.innerText.trim())).to.deep.equal(
          ['firewall-nodebalancer-4', 'firewall-nodebalancer-5']
        );
      });
      cy.get('input[type="checkbox"]')
        .should('have.length', 2)
        .and('be.checked');
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
      const { created_by, description, severity, status, type, updated_by } =
        alertDetails;

      const resourceIds: string[] = request.body.entity_ids.map((id: number) =>
        String(id)
      );
      expect(resourceIds).to.be.deep.equal(['4', '5']);
      const alertResponse: Alert = response?.body;

      // Destructure alert_channels and trigger_conditions from alertResponse
      const {
        alert_channels,
        tags,
        trigger_conditions: responseTriggerConditions,
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
      cy.url().should('endWith', '/alerts/definitions');

      // Confirm toast notification appears
      ui.toast.assertMessage('Alert entities successfully updated.');
    });
  });
});
