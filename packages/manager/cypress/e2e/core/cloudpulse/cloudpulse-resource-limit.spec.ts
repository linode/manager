/**
 * This test suite validates the behavior of the DBaaS (Database as a Service) Dashboard,
 * specifically focusing on how the system handles the maximum resource selection limit
 * for database clusters. It contains two main test cases:
 *
 * Ticket: DI-21897
 *
 * 1. **Max Resource Limit Reached**:
 *    - clusters exceeding the selection limit will be disabled, but they will still be visible in dropdown.
 *      the "Select All" option is hidden and only the available clusters (up to the limit)
 *      are shown in the `Database Clusters` dropdown.
 *    - Ensures that when a region is selected, the `Database Clusters` dropdown is enabled
 *      and shows the appropriate helper text indicating the selection limit.
 *    - Ensures that any additional clusters beyond the limit are disabled in the dropdown.
 *
 * 2. **Max Resource Limit Not Reached**:
 *    - Tests the behavior when the maximum selection limit is not reached (e.g., 10 clusters).
 *    - Confirms that the "Select All" option appears in the dropdown when multiple clusters
 *      are available and the user can select multiple clusters.
 *
 * These tests ensure that the user interface correctly enforces selection limits, provides
 * accurate feedback through helper text, and prevents exceeding the resource limits,
 * thereby validating the system's correctness and user experience.
 */

import { regionFactory } from '@linode/utilities';
import { widgetDetails } from 'support/constants/widgets';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetCloudPulseDashboard,
  mockGetCloudPulseDashboards,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';

import {
  accountFactory,
  dashboardFactory,
  databaseFactory,
  widgetFactory,
} from 'src/factories';

import type { Database } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

const {
  clusterName,
  dashboardName,
  engine,
  id,
  metrics,
  serviceType,
} = widgetDetails.dbaas;

const flags: Partial<Flags> = {
  aclp: { beta: true, enabled: true },
  aclpResourceTypeMap: [
    {
      dimensionKey: 'LINODE_ID',
      maxResourceSelections: 10,
      serviceType: 'linode',
      supportedRegionIds: '',
    },
    {
      dimensionKey: 'cluster_id',
      maxResourceSelections: 1,
      serviceType: 'dbaas',
      supportedRegionIds: 'us-ord',
    },
  ],
};

const dashboard = dashboardFactory.build({
  label: dashboardName,
  service_type: serviceType,
  widgets: metrics.map(({ name, title, unit, yLabel }) => {
    return widgetFactory.build({
      label: title,
      metric: name,
      unit,
      y_label: yLabel,
    });
  }),
});

const mockAccount = accountFactory.build();

const mockRegion = regionFactory.build({
  capabilities: ['Managed Databases'],
  id: 'us-ord',
  label: 'Chicago, IL',
});
const databaseMock: Database = databaseFactory.build({
  cluster_size: 1,
  engine: 'mysql',
  hosts: {
    primary: undefined,
    secondary: undefined,
  },
  label: clusterName,
  region: mockRegion.label,
  status: 'provisioning',
  type: engine,
  version: '1',
});
const extendDatabaseMock: Database = databaseFactory.build({
  cluster_size: 1,
  engine: 'mysql',
  hosts: {
    primary: undefined,
    secondary: undefined,
  },
  label: 'updated-dbass-mock',
  region: mockRegion.label,
  status: 'provisioning',
  type: engine,
  version: '1',
});

describe('DBaaS Dashboard - Max Resource Selection Limit', () => {
  beforeEach(() => {
    mockGetAccount(mockAccount);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard);
    mockGetRegions([mockRegion]).as('fetchRegion');
    mockGetUserPreferences({});
    mockGetDatabases([databaseMock, extendDatabaseMock]).as('fetchtDatabases');
  });

  it('When the maximum resource limit is reached, the appropriate message is displayed, clusters are disabled, and the Select All option is hidden', () => {
    mockAppendFeatureFlags(flags).as('getFeatureFlags');
    cy.visitWithLogin('metrics');
    cy.wait('@getFeatureFlags');

    // Wait for the services and dashboard API calls to complete before proceeding
    cy.wait(['@fetchServices', '@fetchDashboard']);

    // Selecting a dashboard from the autocomplete input.
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('be.visible')
      .click();

    // Select a Database Engine from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type(engine);

    ui.autocompletePopper.findByTitle(engine).should('be.visible').click();

    // Verify that the autocomplete input for 'Database Clusters' is disabled if no region is selected
    ui.autocomplete
      .findByLabel('Database Clusters')
      .should('have.attr', 'disabled');

    // Select a region.
    ui.regionSelect.find().click().clear();
    ui.regionSelect
      .findItemByRegionId(mockRegion.id, [mockRegion])
      .should('be.visible')
      .click();
    // Verify the helper text for the cluster selection limit
    cy.get('[data-qa-textfield-helper-text="true"]')
      .and('be.visible')
      .and('have.text', 'Select up to 1 Database Clusters');

    // Open the autocomplete dropdown by clicking on the input
    ui.autocomplete
      .findByLabel('Database Clusters')
      .should('be.visible')
      .click();

    cy.wait('@fetchtDatabases');

    // Verify the autocomplete dropdown options
    ui.autocompletePopper
      .find()
      .as('autocompletePopper')
      .within(() => {
        cy.get('[data-option-index]')
          .should('be.visible')
          .should('not.have.text', 'Select All')
          .should('have.length', 2);
      });

    ui.autocomplete
      .findByLabel('Database Clusters')
      .should('be.visible')
      .type(databaseMock.label);

    // Select the desired cluster from the filtered dropdown options
    ui.autocompletePopper
      .findByTitle(databaseMock.label)
      .should('be.visible')
      .click();

    // Verify that a specific cluster is disabled in the dropdown
    cy.get('@autocompletePopper')
      .contains('[role="option"]', extendDatabaseMock.label)
      .should('have.attr', 'aria-disabled', 'true');
  });

  it('When the maximum resource limit is not reached, the "Select All" option is visible under Database Clusters input', () => {
    const flags: Partial<Flags> = {
      aclp: { beta: true, enabled: true },
      aclpResourceTypeMap: [
        {
          dimensionKey: 'LINODE_ID',
          maxResourceSelections: 10,
          serviceType: 'linode',
          supportedRegionIds: '',
        },
        {
          dimensionKey: 'cluster_id',
          maxResourceSelections: 10,
          serviceType: 'dbaas',
          supportedRegionIds: 'us-ord',
        },
      ],
    };
    mockAppendFeatureFlags(flags).as('getFeatureFlags');

    cy.visitWithLogin('metrics');
    cy.wait('@getFeatureFlags');

    // Selecting a dashboard from the autocomplete input.
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('be.visible')
      .click();

    // Select a region.
    ui.regionSelect.find().click().clear();
    ui.regionSelect
      .findItemByRegionId(mockRegion.id, [mockRegion])
      .should('be.visible')
      .click();

    // Wait for the services and dashboard API calls to complete before proceeding
    cy.wait(['@fetchServices', '@fetchDashboard']);

    // Selecting a dashboard from the autocomplete input.
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('be.visible')
      .click();

    // Select a Database Engine from the autocomplete input.
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type(engine);

    ui.autocompletePopper.findByTitle(engine).should('be.visible').click();

    // Select a region.
    ui.regionSelect.find().click().clear();
    ui.regionSelect
      .findItemByRegionId(mockRegion.id, [mockRegion])
      .should('be.visible')
      .click();

    // Open the autocomplete dropdown by clicking on the input
    ui.autocomplete
      .findByLabel('Database Clusters')
      .should('be.visible')
      .click();

    cy.wait('@fetchtDatabases');

    // Verify the autocomplete dropdown options
    ui.autocompletePopper
      .find()
      .as('autocompletePopper')
      .within(() => {
        cy.get('[data-option-index]')
          .should('be.visible')
          .should(
            'have.text',
            'Select All ' + databaseMock.label + extendDatabaseMock.label
          )
          .should('have.length', 3);
      });
  });
});
