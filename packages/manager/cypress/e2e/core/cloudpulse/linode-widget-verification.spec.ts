import {
  selectTimeRange,
  selectServiceName,
  selectAndVerifyResource,
  assertSelections,
} from 'support/util/cloudpulse';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import {
  mockCloudPulseJWSToken,
  mockCloudPulseDashboardServicesResponse,
  mockCloudPulseCreateMetrics,
  mockCloudPulseGetDashboards,
  mockCloudPulseGetMetricDefinitions,
  mockCloudPulseServices,
} from 'support/intercepts/cloudpulseAPIHandler';
import { ui } from 'support/ui';
import { timeRange, widgetDetails, granularity } from 'support/constants/widget-service';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { createMetricResponse } from '@src/factories/widget';
import type { Flags } from 'src/featureFlags';
import { accountFactory, extendedDashboardFactory, kubeLinodeFactory, linodeFactory, metricDefinitionsFactory, regionFactory } from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { extendRegion } from 'support/util/regions';



/**
 * This test ensures that widget titles are displayed correctly on the dashboard.
 * This test suite is dedicated to verifying the functionality and display of widgets on the Cloudpulse dashboard.
 *  It includes:
 * Validating that widgets are correctly loaded and displayed.
 * Ensuring that widget titles and data match the expected values.
 * Verifying that widget settings, such as granularity and aggregation, are applied correctly.
 * Testing widget interactions, including zooming and filtering, to ensure proper behavior.
 * Each test ensures that widgets on the dashboard operate correctly and display accurate information.
 */



const y_labels = [
  'system_cpu_utilization_ratio',
  'system_memory_usage_bytes',
  'system_network_io_bytes_total',
  'system_disk_operations_total',
];
const widgets= widgetDetails.linode;
const metrics =widgets.metrics;
export const dashboardName = widgets.dashboardName;
export const region = widgets.region;
export const actualRelativeTimeDuration = timeRange.Last24Hours;
export const resource = widgets.resource
const widgetLabels: string[] = metrics.map(widget => widget.title); 
const metricsLabels: string[] = metrics.map(widget => widget.name); 
const service_type =widgets.service_type;
const dashboardId=widgets.id
const dashboard = extendedDashboardFactory(dashboardName, widgetLabels, metricsLabels, y_labels,service_type).build();
const metricDefinitions = metricDefinitionsFactory(widgetLabels, metricsLabels).build();
const mockKubeLinode = kubeLinodeFactory.build();
const mockLinode = linodeFactory.build({
  label: resource,
  id: mockKubeLinode.instance_id ?? undefined,
});
const mockAccount = accountFactory.build();
const mockDallasRegion = extendRegion(
  regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-ord',
    label: 'Chicago, IL',
    country: 'us',
  })
);

describe('Dashboard Widget Verification Tests', () => {
 beforeEach(() => {
      mockAppendFeatureFlags({
      aclp: makeFeatureFlagData<Flags['aclp']>({ beta: true, enabled: true }),
    }).as('getFeatureFlags');
    mockGetAccount(mockAccount).as('getAccount'); // Enables the account to have capability for Akamai Cloud Pulse
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLinodes([mockLinode]).as('getLinodes');
    mockCloudPulseGetMetricDefinitions(metricDefinitions,service_type);
    mockCloudPulseGetDashboards(dashboard,service_type).as('dashboard');
    mockCloudPulseServices(service_type).as('services');
    mockCloudPulseDashboardServicesResponse(dashboard,dashboardId);
    mockCloudPulseJWSToken(service_type);
    const responsePayload = createMetricResponse(actualRelativeTimeDuration, granularity.Min5);
    mockCloudPulseCreateMetrics(responsePayload,service_type).as('getMetrics');
    mockGetRegions([mockDallasRegion]).as('getRegions');
});

  it('should verify cloudpulse availability when feature flag is set to false', () => {
    mockAppendFeatureFlags({
      aclp: makeFeatureFlagData<Flags['aclp']>({ beta: true, enabled: false }),
    });
    mockGetFeatureFlagClientstream();
    cy.visitWithLogin('monitor/cloudpulse'); // since we disabled the flag here, we should have not found
    cy.findByText('Not Found').should('be.visible'); // not found
  });

  it('should set available granularity of all the widgets', () => {
    setupMethod()
    metrics.forEach((testData) => {
      cy.wait(5000);
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector).as('widget')
      cy.get('@widget')
       .should('be.visible')
        .first()
        .within(() => {
          ui.autocomplete
            .findByTitleCustom('Select an Interval')
            .should('be.visible')
            .findByTitle('Open')
            .click();
         ui.autocompletePopper
            .findByTitle(testData.expectedGranularity).as('granularityOption')
            cy.get('@granularityOption')
            .should('be.visible')
            .should('have.text', testData.expectedGranularity)
            .click();
            cy.findByDisplayValue(testData.expectedGranularity).should('exist');
            assertSelections(testData.expectedGranularity);
        });
    });
  });
  
  it('should verify the title of the widget', () => {
    setupMethod()
    metrics.forEach((testData) => {
      const widgetSelector = `[data-qa-widget-header="${testData.title}"]`;
      cy.get(widgetSelector).invoke('text').then((text) => {
       expect(text.trim()).to.equal(testData.title);
      });
    });
  });

  it('should set available aggregation of all the widgets', () => {
    setupMethod()
    metrics.forEach((testData) => {
      cy.wait(5000);
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .first()
        .should('be.visible')
        .within(() => {
          ui.autocomplete
            .findByTitleCustom('Select an Aggregate Function')
            .should('be.visible')
            .findByTitle('Open')
            .click();
          ui.autocompletePopper
            .findByTitle(testData.expectedAggregation)
            .should('be.visible')
            .should('have.text', testData.expectedAggregation)
            .click();
            cy.findByDisplayValue(testData.expectedAggregation).should('exist');
          assertSelections(testData.expectedAggregation);
        });
    });
  });

  it('should verify available granularity of the widget', () => {
    setupMethod()
    metrics.forEach((testData) => {
      cy.wait(5000);
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .first()
        .scrollIntoView()
        .should('be.visible')
        .within(() => {
          ui.autocomplete.findByTitleCustom('Select an Interval')
            .findByTitle('Open')
            .click();
          testData.expectedGranularityArray.forEach((option) => {
            ui.autocompletePopper
              .findByTitle(option)
              .should('be.visible')
          });
          ui.autocomplete
            .findByTitleCustom('Select an Interval')
            .should('be.visible')
            .findByTitle('Close')
            .should('be.visible')
            .click();
        });
    });
  });

  it('should verify available aggregation of the widget', () => {
    setupMethod()
    metrics.forEach((testData) => {
      cy.wait(5000);
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .first()
        .scrollIntoView()
        .should('be.visible')
        .within(() => {
          ui.autocomplete
            .findByTitleCustom('Select an Aggregate Function')
            .findByTitle('Open')
            .click();
          testData.expectedAggregationArray.forEach((option) => {
            ui.autocompletePopper
              .findByTitle(option)
              .should('be.visible')
          });
          ui.autocomplete
            .findByTitleCustom('Select an Aggregate Function')
            .should('be.visible')
            .findByTitle('Close')
            .should('be.visible')
            .click();
        });
    });
  });

  it('should zoom in and out of all the widgets', () => {
    setupMethod()
    metrics.forEach((testData) => {
      cy.wait(5000);
      cy.get(`[data-qa-widget="${testData.title}"]`).as('widget');
      cy.get('@widget').should('be.visible').within(() => {
        ui.cloudpulse.findZoomButtonByTitle('zoom-in').should('be.visible')
        .should('be.enabled')
        .click();
        cy.get('@widget').should('be.visible');
        cy.get('[data-testid="linegraph-wrapper"] canvas').as('canvas')
          .should('exist')       
          .and('be.visible');
        ui.cloudpulse.findZoomButtonByTitle('zoom-out').should('be.visible')
        .should('be.enabled')
        .click();
        cy.get('@widget').should('be.visible');
        cy.get('@canvas').should('exist').and('be.visible');
      });
    
    });
  });
  
  it('should apply global refresh button and verify network calls', () => {
    setupMethod();
    
    ui.cloudpulse.findRefreshIcon().should('be.visible').click();
    
    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']).then((interceptions) => {
      const interceptionsArray = Array.isArray(interceptions) ? interceptions : [interceptions];
      
      interceptionsArray.forEach((interception) => {
        const { body: requestPayload } = interception.request;
        const { metric, time_granularity: granularity, relative_time_duration: timeRange, aggregate_function: aggregateFunction } = requestPayload;
        const metricData = metrics.find(data => data.name === metric);
         // Check if metricData and its expected properties are available
        if (!metricData || !metricData.expectedGranularity || !metricData.expectedAggregation) {
          expect.fail('metricData or its expected properties are not defined.');
        }
         const expectedRelativeTimeDuration = timeRange
          ? `Last ${timeRange.value} ${['hour', 'hr'].includes(timeRange.unit.toLowerCase()) ? 'Hours' : timeRange.unit}`
          : '';
         const currentGranularity = granularity
          ? `${granularity.value} ${['hour', 'hours'].includes(granularity.unit.toLowerCase()) ? 'hr' : granularity.unit}`
          : '';
         expect(metric).to.equal(metricData.name);
        expect(currentGranularity).to.equal(metricData.expectedGranularity);
        expect(expectedRelativeTimeDuration).to.equal(actualRelativeTimeDuration);
       // expect(aggregateFunction).to.equal(metricData.expectedAggregation);
      });
    });
  });
});
  

  const setupMethod = () => {
    mockGetUserPreferences({}).as('getUserPreferences');
    cy.visitWithLogin('monitor/cloudpulse');
    cy.get('[data-qa-header="Akamai Cloud Pulse"]').should('be.visible').should('have.text', 'Akamai Cloud Pulse');
    selectServiceName(dashboardName);
    assertSelections(dashboardName);
    selectTimeRange(actualRelativeTimeDuration, Object.values(timeRange));
    assertSelections(actualRelativeTimeDuration);
    ui.regionSelect.find().click().type(`${region}{enter}`);
    assertSelections(region);
    selectAndVerifyResource(resource);
};
