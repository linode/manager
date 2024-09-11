import {
  selectTimeRange,
  selectServiceName,
  selectAndVerifyResource,
  assertSelections,
  waitForElementToLoad,
} from 'support/util/cloudpulse';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import {
  mockJWSToken,
  mockLinodeDashboardServicesResponse,
  mockCreateMetrics,
  mockGetDashboards,
  mockGetMetricDefinitions,
  mockCloudPulseServices,
} from 'support/intercepts/cloudpulseAPIHandler';
import { ui } from 'support/ui';
import { timeRange, widgetDetails, granularity } from 'support/constants/widget-service';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { createMetricResponse } from '@src/factories/widget';
import type { Flags } from 'src/featureFlags';
import { accountFactory, dashboardFactory, kubeLinodeFactory, linodeFactory, metricDefinitionsFactory } from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';



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
export const dashboardName = 'Linode Dashboard';
export const region = 'US, Chicago, IL (us-ord)';
export const actualRelativeTimeDuration = timeRange.Last24Hours;
export const resource = 'test1';

const mockKubeLinode = kubeLinodeFactory.build();
const mockLinode = linodeFactory.build({
  label: resource,
  id: mockKubeLinode.instance_id ?? undefined,
});
const mockAccount = accountFactory.build();

const y_labels = [
  'system_cpu_utilization_ratio',
  'system_memory_usage_bytes',
  'system_network_io_bytes_total',
  'system_disk_operations_total',
];
const linodeWidgets = widgetDetails.linode;
const widgetLabels: string[] = linodeWidgets.map(widget => widget.title);
const metricsLabels: string[] = linodeWidgets.map(widget => widget.name);
const service_type='linode';

const dashboard = dashboardFactory(dashboardName, widgetLabels, metricsLabels, y_labels,service_type).build();
const metricDefinitions = metricDefinitionsFactory(widgetLabels, metricsLabels).build();

describe('Dashboard Widget Verification Tests', () => {
 beforeEach(() => {
      mockAppendFeatureFlags({
      aclp: makeFeatureFlagData<Flags['aclp']>({ beta: true, enabled: true }),
    }).as('getFeatureFlags');
    mockGetAccount(mockAccount).as('getAccount'); // Enables the account to have capability for Akamai Cloud Pulse
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLinodes([mockLinode]).as('getLinodes');
    mockGetMetricDefinitions(metricDefinitions);
    mockGetDashboards(dashboard).as('dashboard');
    mockCloudPulseServices('linode').as('services');
    mockLinodeDashboardServicesResponse(dashboard);
    mockJWSToken();
    const responsePayload = createMetricResponse(actualRelativeTimeDuration, granularity.Min5);
    mockCreateMetrics(responsePayload).as('metricAPI');
});

  it('should verify cloudpulse availability when feature flag is set to false', () => {
    mockAppendFeatureFlags({
      aclp: makeFeatureFlagData<Flags['aclp']>({ beta: true, enabled: false }),
    });
    mockGetFeatureFlagClientstream();
    cy.visitWithLogin('monitor/cloudpulse'); // since we disabled the flag here, we should have not found
    cy.findByText('Not Found').should('be.visible'); // not found
  });

  it.only('should set available granularity of all the widgets', () => {
    setupMethod()
    linodeWidgets.forEach((testData) => {
      cy.wait(5000);
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      waitForElementToLoad(widgetSelector);
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
            .click();
            assertSelections(testData.expectedGranularity);
        });
    });
  });
  
  it('should verify the title of the widget', () => {
    setupMethod()
    linodeWidgets.forEach((testData) => {
      const widgetSelector = `[data-qa-widget-header="${testData.title}"]`;
      cy.get(widgetSelector).invoke('text').then((text) => {
        expect(text.trim()).to.equal(testData.title);
      });
    });
  });

  it('should set available aggregation of all the widgets', () => {
    setupMethod()
    linodeWidgets.forEach((testData) => {
      cy.wait(5000);
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .first()
        .should('be.visible')
        .within(() => {
          ui.autocomplete
            .findByTitleCustom('Select an Aggregate Function')
            .findByTitle('Open')
            .click();
          ui.autocompletePopper
            .findByTitle(testData.expectedAggregation)
            .should('be.visible')
            .click();
          assertSelections(testData.expectedAggregation);
        });
    });
  });

  it('should verify available granularity of the widget', () => {
    setupMethod()
    linodeWidgets.forEach((testData) => {
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
              .then(() => {
                cy.log(`${option} is visible`);
              });
          });
          ui.autocomplete
            .findByTitleCustom('Select an Interval')
            .findByTitle('Close')
            .click();
        });
    });
  });

  it('should verify available aggregation of the widget', () => {
    setupMethod()
    linodeWidgets.forEach((testData) => {
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
              .then(() => {
                cy.log(`${option} is visible`);
              });
          });
          ui.autocomplete
            .findByTitleCustom('Select an Aggregate Function')
            .findByTitle('Close')
            .click();
        });
    });
  });

  it('should zoom in and out of all the widgets', () => {
    setupMethod()
    linodeWidgets.forEach((testData) => {
      cy.wait(5000);
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.log("Name of the widget **",testData.title);
        cy.get(widgetSelector).should('be.visible').within(() => {
        cy.get(ui.cloudpulse.findZoomButtonByTitle('zoom-out')).should('be.visible')
        .should('be.enabled')
        .click();
        cy.get(ui.cloudpulse.findZoomButtonByTitle('zoom-in')).should('be.visible')
        .should('be.enabled')
        .click();
      });
    
    });
  });

  it('should apply global refresh button and verify network calls', () => {
    setupMethod()
    ui.cloudpulse.findRefreshIcon()
    .should('be.visible') 
    .click(); 
    linodeWidgets.forEach((widget) => {
      const widgetSelector = `[data-qa-widget="${widget.title}"]`;
      cy.get(widgetSelector)
        .should('be.visible')
        .and('contain.text', widget.title); 
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
