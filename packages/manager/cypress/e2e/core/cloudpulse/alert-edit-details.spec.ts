/**
 * @file Integration Tests for the CloudPulse Edit Alert Page.
 *
 * This file contains Cypress tests for the Edit Alert page of the CloudPulse application.
 * are correctly displayed and interactive on the Edit page. It ensures that users can navigate
 */
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetAlertDefinitions,
  mockGetAllAlertDefinitions,
  mockUpdateAlertDefinitions,
} from 'support/intercepts/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';

import {
  accountFactory,
  alertFactory,
  databaseFactory,
  regionFactory,
} from 'src/factories';

import type { Database } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

const flags: Partial<Flags> = { aclp: { beta: true, enabled: true } };
const mockAccount = accountFactory.build();
const alertDetails = alertFactory.build({
  entity_ids: ['1', '2', '3', '4', '5'],
  service_type: 'dbaas',
  severity: 1,
  status: 'enabled',
  type: 'system',
});
const { id, label, service_type } = alertDetails;
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
    engine: 'mysql',
    region: regions[index % regions.length].id,
    status: 'active',
    type: 'MySQL',
  }));
const pages = [1, 2];
const expectedResourceIds = Array.from({ length: 50 }, (_, i) => String(i + 1));

describe('Integration Tests for Edit Alert', () => {
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
      '5 of 50 resources are selected'
    );
    // Select all resources
    cy.get('[data-qa-notice="true"]').within(() => {
      ui.button.findByTitle('Select All').should('be.visible').click();

      // Unselect button should be visible after clicking on Select All buttom
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
    cy.get('[data-qa-cancel="true"]')
      .should('be.enabled')
      .should('have.text', 'Cancel');

    // Click the Confirm button
    ui.button
      .findByAttribute('label', 'Confirm')
      .should('be.enabled')
      .should('have.text', 'Confirm')
      .click();

    // Verify the update request and response
    cy.wait('@updateDefinitions').then(({ request, response }) => {
      // Assert successful API response
      const resourceIds = request.body.entity_ids.map(String);
      // Compare resource IDs
      expect(
        resourceIds.join(','),
        'Resource IDs should match expected values'
      ).to.equal(expectedResourceIds.join(','));
    });
    cy.url().should('endWith', '/monitor/alerts/definitions');

    // Confirm toast notification appears
    ui.toast.assertMessage('Alert resources successfully updated.');
  });
});
