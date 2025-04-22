/**
 * @file Error Handling Tests for CloudPulse Region Selection
 *
 * This file contains tests to verify the proper handling of errors
 * when interacting with region selection features in CloudPulse.
 * The tests focus on scenarios such as invalid or unsupported regions,
 * and ensure the application behaves as expected, providing appropriate
 * error messages or fallback behavior when necessary.
 */

import { regionFactory } from '@linode/utilities';
import { widgetDetails } from 'support/constants/widgets';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetCloudPulseDashboard,
  mockGetCloudPulseDashboards,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';

import { accountFactory, dashboardFactory, databaseFactory, widgetFactory } from 'src/factories';

import type { Flags } from 'src/featureFlags';
import { Database } from '@linode/api-v4';
import { mockGetDatabases } from 'support/intercepts/databases';

const { dashboardName, id, metrics, serviceType } = widgetDetails.dbaas;

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

const extendedMockRegion = regionFactory.build({
  capabilities: ['Managed Databases'],
  id: 'us-east',
  label: 'Newark,NL',
});

const databaseMock: Database = databaseFactory.build({
  cluster_size: 3,
  engine: 'mysql',
  label: 'mysql-cluster',
  region: mockRegion.id,
  status: 'provisioning',
  type: 'PostgreSQL',
  version: '1',
});

describe('Integration Tests for DBaaS Dashboard ', () => {
  beforeEach(() => {
    mockGetAccount(mockAccount); // Enables the account to have capability for Akamai Cloud Pulse
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard);
    mockGetRegions([mockRegion, extendedMockRegion]).as('fetchRegion');
    mockGetUserPreferences({});
    mockGetDatabases([databaseMock]).as('getDatabases');
  });

  it('should only display the Chicago region in the dropdown when supportedRegionIds is set to Chicago (us-ord)', () => {
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

    // Wait for the services and dashboard ,Region API calls to complete before proceeding
    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchRegion']);

    // Select a Database Engine from the autocomplete input. (This is now mandatory to see the regions, because of the dependent filter)
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type('PostgreSQL');

    ui.autocompletePopper
      .findByTitle('PostgreSQL')
      .should('be.visible')
      .click();

    //  Select a region from the dropdown.
    ui.regionSelect.find().click();

    ui.regionSelect.find().type(extendedMockRegion.label);

    // Since DBaaS does not support this region, we expect it to not be in the dropdown.

    ui.autocompletePopper.find().within(() => {
      cy.findByText(
        `${extendedMockRegion.label} (${extendedMockRegion.id})`
      ).should('not.exist');
    });

    ui.regionSelect.find().click().clear();
    ui.regionSelect
      .findItemByRegionId(mockRegion.id, [mockRegion])
      .should('be.visible')
      .click();

    // Expand the applied filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
        .should('be.visible')
        .should('have.text', 'US, Chicago, IL');
    });
  });
  // Reason: Not needed
  it.skip('If the supportedRegionIds column is removed, all mocked regions will be considered supported by default', () => {
    const flags: Partial<Flags> = {
      aclp: { beta: true, enabled: true },
      aclpResourceTypeMap: [
        {
          dimensionKey: 'cluster_id',
          maxResourceSelections: 10,
          serviceType: 'dbaas',
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

    // Wait for the services and dashboard ,Region API calls to complete before proceeding
    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchRegion']);

    ui.regionSelect.find().click();
    ui.autocompletePopper.find().within(() => {
      cy.get('[data-option-index]').should('have.length', 2);
    });

    ui.regionSelect
      .findItemByRegionId(mockRegion.id, [mockRegion])
      .should('be.visible')
      .click();

    // Expand the applied filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
        .should('be.visible')
        .should('have.text', 'US, Chicago, IL');
    });
  });
  it('supportedRegionIds is empty, no regions will be displayed', () => {
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
          supportedRegionIds: '',
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

    // Wait for the services and dashboard ,Region API calls to complete before proceeding
    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchRegion']);

    // Select a Database Engine from the autocomplete input. (This is now mandatory to see the regions, because of the dependent filter)
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type('PostgreSQL');

    ui.autocompletePopper
      .findByTitle('PostgreSQL')
      .should('be.visible')
      .click();

    ui.regionSelect.find().click();
    ui.autocompletePopper.find().within(() => {
      cy.get('[data-option-index]').should('have.length', 0);
    });

    // Expand the applied filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get('h3').should('have.length', '1'); // because cluster is mandatory
    });
  });

  it('should only display mocking region as Chicago and then supportedRegionIds is set to Junk', () => {
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
          supportedRegionIds: 'junk',
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

    // Wait for the services and dashboard ,Region API calls to complete before proceeding
    cy.wait([
      '@fetchServices',
      '@fetchDashboard',
      '@fetchRegion',
      '@getDatabases',
    ]);

    // Select a Database Engine from the autocomplete input. (This is now mandatory to see the regions, because of the dependent filter)
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type('PostgreSQL');

    ui.autocompletePopper
      .findByTitle('PostgreSQL')
      .should('be.visible')
      .click();

    ui.regionSelect.find().click();
    ui.autocompletePopper.find().within(() => {
      cy.get('[data-option-index]').should('have.length', 0);
    });

    // Expand the applied filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get('h3').should('have.length', '1'); // because cluster is mandatory
    });
  });

  it('should only display mocking region as Chicago and then supportedRegionIds is set to us-east', () => {
    // Since we are mocking the region as Chicago but setting supportedRegionIds to Newark,
    // no region should be displayed in the dropdown, as the region displayed must match the supported region

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
          supportedRegionIds: 'us-east',
        },
      ],
    };
    mockAppendFeatureFlags(flags).as('getFeatureFlags');
    mockGetRegions([mockRegion]).as('fetchRegion');

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

    // Wait for the services and dashboard ,Region API calls to complete before proceeding
    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchRegion']);

    // Select a Database Engine from the autocomplete input. (This is now mandatory to see the regions, because of the dependent filter)
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type('PostgreSQL');

    ui.autocompletePopper
      .findByTitle('PostgreSQL')
      .should('be.visible')
      .click();

    ui.regionSelect.find().click();
    ui.autocompletePopper.find().within(() => {
      cy.get('[data-option-index]').should('have.length', 0);
    });

    // Expand the applied filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get('h3').should('have.length', '1'); // because cluster is mandatory
    });
  });

  it('should only display the Chicago region in the dropdown when supportedRegionIds is set to Chicago (us-ord) with extra spaces', () => {
    // Adding extra space to supportedRegionIds with the value ' us-ord', and the value should be trimmed to remove the extra spaces.',
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
          supportedRegionIds: 'in-west,  us-ord  ',
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

    // Wait for the services and dashboard ,Region API calls to complete before proceeding
    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchRegion']);

    // Select a Database Engine from the autocomplete input. (This is now mandatory to see the regions, because of the dependent filter)
    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type('PostgreSQL');

    ui.autocompletePopper
      .findByTitle('PostgreSQL')
      .should('be.visible')
      .click();

    //  Select a region from the dropdown.
    ui.regionSelect.find().click();

    ui.regionSelect.find().type(extendedMockRegion.label);

    // Since DBaaS does not support this region, we expect it to not be in the dropdown.

    ui.autocompletePopper.find().within(() => {
      cy.findByText(
        `${extendedMockRegion.label} (${extendedMockRegion.id})`
      ).should('not.exist');
    });

    ui.regionSelect.find().click().clear();
    ui.regionSelect
      .findItemByRegionId(mockRegion.id, [mockRegion])
      .should('be.visible')
      .click();

    ui.regionSelect.find().click();
    ui.autocompletePopper.find().within(() => {
      cy.get('[data-option-index]').should('have.length', 1);
    });

    // Expand the applied filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]').within(() => {
      cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
        .should('be.visible')
        .should('have.text', 'US, Chicago, IL');
    });
  });
});
