/**
 * @file Error Handling Tests for CloudPulse Region Selection
 *
 * This file contains tests to verify the proper handling of errors
 * when interacting with region selection features in CloudPulse.
 * The tests focus on scenarios such as invalid or unsupported regions,
 * and ensure the application behaves as expected, providing appropriate
 * error messages or fallback behavior when necessary.
 */

import {
  linodeFactory,
  nodeBalancerFactory,
  regionFactory,
} from '@linode/utilities';
import { widgetDetails } from 'support/constants/widgets';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetCloudPulseDashboard,
  mockGetCloudPulseDashboards,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetFirewalls } from 'support/intercepts/firewalls';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetNodeBalancers } from 'support/intercepts/nodebalancers';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';

import {
  accountFactory,
  dashboardFactory,
  dashboardMetricFactory,
  databaseFactory,
  firewallFactory,
  flagsFactory,
  widgetFactory,
} from 'src/factories';
import { NO_REGION_MESSAGE } from 'src/features/CloudPulse/Utils/constants';

import type { CloudPulseServiceType, Database } from '@linode/api-v4';

const { dashboardName, id, metrics } = widgetDetails.dbaas;
const serviceType = 'dbaas';
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
  monitors: {
    metrics: ['Managed Databases'],
    alerts: [],
  },
});

const extendedMockRegion = regionFactory.build({
  capabilities: ['Managed Databases', 'Cloud Firewall'],
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
    mockGetUserPreferences({});
    mockGetDatabases([databaseMock]).as('getDatabases');
    mockAppendFeatureFlags(flagsFactory.build());
  });

  it('should only display the Chicago region in the dropdown when supportedRegionIds is set to Chicago (us-ord)', () => {
    mockGetRegions([mockRegion, extendedMockRegion]).as('fetchRegion');
    cy.visitWithLogin('metrics');

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
      .type('MySQL');

    ui.autocompletePopper.findByTitle('MySQL').should('be.visible').click();

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
  it('supportedRegionIds is empty, no regions will be displayed', () => {
    mockGetRegions([extendedMockRegion]).as('fetchRegion');
    cy.visitWithLogin('metrics');
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
      .type('MySQL');

    ui.autocompletePopper.findByTitle('MySQL').should('be.visible').click();

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
    mockGetRegions([{ ...mockRegion, monitors: undefined }]).as('fetchRegion');
    cy.visitWithLogin('metrics');

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
      .type('MySQL');

    ui.autocompletePopper.findByTitle('MySQL').should('be.visible').click();

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

    mockGetRegions([{ ...mockRegion, monitors: undefined }]).as('fetchRegion');

    cy.visitWithLogin('metrics');

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
      .type('MySQL');

    ui.autocompletePopper.findByTitle('MySQL').should('be.visible').click();

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
    mockGetRegions([mockRegion, extendedMockRegion]).as('fetchRegion');

    cy.visitWithLogin('metrics');

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
      .type('MySQL');

    ui.autocompletePopper.findByTitle('MySQL').should('be.visible').click();

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

  it(`should show a region-unavailable message for ${serviceType} when no database clusters are available`, () => {
    const { dashboardName, id } = widgetDetails.dbaas;
    mockGetAccount(mockAccount); // Enables the account to have capability for Akamai Cloud Pulse
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard);
    mockGetDatabases([]).as('getDatabases');

    cy.visitWithLogin('metrics');
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('be.visible')
      .click();

    ui.autocomplete
      .findByLabel('Database Engine')
      .should('be.visible')
      .type('MySQL');

    ui.autocompletePopper.findByTitle('MySQL').should('be.visible').click();
    ui.regionSelect.find().click();

    cy.get('[data-qa-autocomplete-popper="true"]')
      .should('be.visible')
      .and('have.text', NO_REGION_MESSAGE[serviceType]);
  });

  it('should show a region-unavailable message for linode when no linodes are available', () => {
    const { dashboardName, id, resource, serviceType } = widgetDetails.linode;
    const dashboard = dashboardFactory.build({
      label: dashboardName,
      service_type: serviceType as CloudPulseServiceType,
      id,
      widgets: metrics.map(({ name, title, unit, yLabel }) => {
        return widgetFactory.build({
          label: title,
          metric: name,
          unit,
          y_label: yLabel,
          service_type: serviceType as CloudPulseServiceType,
        });
      }),
    });

    const mockLinode = linodeFactory.build({
      id: 2,
      label: resource,
      region: 'us-ord',
    });
    mockGetLinodes([mockLinode]);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard);
    cy.visitWithLogin('metrics');
    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('be.visible')
      .click();

    ui.regionSelect.find().click();

    cy.get('[data-qa-autocomplete-popper="true"]')
      .should('be.visible')
      .and('have.text', NO_REGION_MESSAGE[serviceType]);
  });

  it('should show a region-unavailable message for nodeblancer when no nodeblancers are available', () => {
    const { dashboardName, id, resource, serviceType } =
      widgetDetails.nodebalancer;
    const mockNodeBalancer = nodeBalancerFactory.build({
      label: resource,
      region: 'us-east',
    });
    const dashboard = dashboardFactory.build({
      label: dashboardName,
      service_type: serviceType as CloudPulseServiceType,
      id,
      widgets: metrics.map(({ name, title, unit, yLabel }) => {
        return widgetFactory.build({
          label: title,
          metric: name,
          unit,
          y_label: yLabel,
          service_type: serviceType as CloudPulseServiceType,
        });
      }),
    });
    mockGetAccount(accountFactory.build({}));
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard);

    mockGetRegions([mockRegion]);
    mockGetNodeBalancers([mockNodeBalancer]);
    mockGetUserPreferences({});
    cy.visitWithLogin('metrics');

    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('be.visible')
      .click();

    ui.regionSelect.find().click();
    cy.get('[data-qa-autocomplete-popper="true"]')
      .should('be.visible')
      .and('have.text', NO_REGION_MESSAGE[serviceType]);
  });

  it('should show a region-unavailable message for firewall when no linodes-region are available', () => {
    const { dashboardName, id, serviceType, firewalls } =
      widgetDetails.firewall;

    const metricDefinitions = metrics.map(({ name, title, unit }) =>
      dashboardMetricFactory.build({
        label: title,
        metric: name,
        unit,
      })
    );
    const mockLinode = linodeFactory.build({
      id: 1,
      label: firewalls,
      region: 'us-east',
    });
    const dashboard = dashboardFactory.build({
      label: dashboardName,
      service_type: serviceType as CloudPulseServiceType,
      id,
      widgets: metrics.map(({ name, title, unit, yLabel }) => {
        return widgetFactory.build({
          label: title,
          metric: name,
          unit,
          y_label: yLabel,
          service_type: serviceType as CloudPulseServiceType,
        });
      }),
    });
    const mockFirewalls = firewallFactory.build({ label: firewalls });

    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard);
    mockGetLinodes([mockLinode]);
    mockGetFirewalls([mockFirewalls]);
    mockGetUserPreferences({});
    mockGetRegions([mockRegion]);

    // navigate to the metrics page
    cy.visitWithLogin('/metrics');

    // Wait for the services and dashboard API calls to complete before proceeding
    cy.wait(['@fetchServices', '@fetchDashboard']);

    ui.autocomplete
      .findByLabel('Dashboard')
      .should('be.visible')
      .type(dashboardName);

    ui.autocompletePopper
      .findByTitle(dashboardName)
      .should('be.visible')
      .click();
    ui.autocomplete
      .findByLabel('Firewalls')
      .should('be.visible')
      .type(`${firewalls}{enter}`);

    ui.autocomplete.findByLabel('Firewalls').click();

    ui.regionSelect.find().click();

    cy.get('[data-qa-autocomplete-popper="true"]')
      .should('be.visible')
      .and('have.text', NO_REGION_MESSAGE[serviceType]);
  });
});