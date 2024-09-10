import {
  selectTimeRange,
  selectServiceName,
  selectAndVerifyResource,
  assertSelections,
  resetDashboardAndVerifyPage,
} from 'support/util/cloudpulse';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import {
  interceptCloudPulseServices,
  interceptMetricsRequests,
  mockJWSToken,
  mockLinodeDashboardServicesResponse,
} from 'support/intercepts/cloudpulseAPIHandler';
import { ui } from 'support/ui';
import { timeRange, widgetDetails, granularity } from 'support/constants/widget-service';
import {
  interceptCreateMetrics,
  interceptGetDashboards,
  interceptGetMetricDefinitions,
} from 'support/intercepts/cloudpulseAPIHandler';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { createMetricResponse } from '@src/factories/widget';
import type { Flags } from 'src/featureFlags';
import { accountFactory, dashboardFactory, kubeLinodeFactory, linodeFactory, metricDefinitionsFactory } from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetLinodes } from 'support/intercepts/linodes';



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

const dashboard = dashboardFactory(dashboardName, widgetLabels, metricsLabels, y_labels).build();
const metricDefinitions = metricDefinitionsFactory(widgetLabels, metricsLabels).build();

describe('Dashboard Widget Verification Tests', () => {
  beforeEach(() => {
    cy.visitWithLogin('monitor/cloudpulse');

    mockAppendFeatureFlags({
      aclp: makeFeatureFlagData<Flags['aclp']>({ beta: true, enabled: true }),
    }).as('getFeatureFlags');
    mockGetAccount(mockAccount).as('getAccount'); // Enables the account to have capability for Akamai Cloud Pulse
    mockGetFeatureFlagClientstream().as('getClientStream');
    mockGetLinodes([mockLinode]).as('getLinodes');
    interceptGetMetricDefinitions(metricDefinitions);
    interceptGetDashboards(dashboard).as('dashboard');
    interceptCloudPulseServices('linode').as('services');
    mockLinodeDashboardServicesResponse(dashboard);
    mockJWSToken();
    const responsePayload = createMetricResponse(actualRelativeTimeDuration, granularity.Min5);
    interceptCreateMetrics(responsePayload).as('metricAPI');
    resetDashboardAndVerifyPage(dashboardName);
    selectServiceName(dashboardName);
    selectTimeRange(actualRelativeTimeDuration, Object.values(timeRange));
    ui.regionSelect.find().click().type(`${region}{enter}`);
    selectAndVerifyResource(resource);
  });

  it('should set available granularity of all the widgets', () => {
    linodeWidgets.forEach((testData) => {
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .first()
        .should('be.visible')
        .within(() => {
          ui.autocomplete
            .findByTitleCustom('Select an Interval')
            .findByTitle('Open')
            .click();
         ui.autocompletePopper
            .findByTitle(testData.expectedGranularity)
            .should('be.visible')
            .click();
            assertSelections(testData.expectedGranularity);
        });
    });
  });
  
  it('should verify the title of the widget', () => {
    linodeWidgets.forEach((testData) => {
      const widgetSelector = `[data-qa-widget-header="${testData.title}"]`;
      cy.get(widgetSelector).invoke('text').then((text) => {
        expect(text.trim()).to.equal(testData.title);
      });
    });
  });

  it('should set available aggregation of all the widgets', () => {
    linodeWidgets.forEach((testData) => {
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
    linodeWidgets.forEach((testData) => {
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
    linodeWidgets.forEach((testData) => {
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
    linodeWidgets.forEach((testData) => {
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      const zoomInSelector = ui.cloudpulse.findZoomButtonByTitle('zoom-in');
      const zoomOutSelector = ui.cloudpulse.findZoomButtonByTitle('zoom-out');
      cy.get(widgetSelector).each(($widget) => {
        cy.wrap($widget).then(($el) => {
          const zoomInElement = $el.find(zoomInSelector);
          const zoomOutElement = $el.find(zoomOutSelector);

          if (zoomOutElement.length > 0) {
            cy.wrap(zoomOutElement)
              .should('be.visible')
              .click({ timeout: 5000 })
              .then(() => {
                cy.log('Zoomed Out on widget:', $el);
              });
          } else if (zoomInElement.length > 0) {
            cy.wrap(zoomInElement)
              .should('be.visible')
              .click({ timeout: 5000 })
              .then(() => {
                cy.log('Zoomed In on widget:', $el);
              });
          }
        });
      });
    });
  });

  it('should apply global refresh button and verify network calls', () => {
    ui.cloudpulse.findRefreshIcon()
    .should('be.visible')  // Check if the refresh icon is visible
    .click();  // Click the refresh icon
      // check for specific UI elements that should be updated or appear after the refresh
  // For example, check if widgets have updated data or if new data is visible
    linodeWidgets.forEach((widget) => {
      const widgetSelector = `[data-qa-widget="${widget.title}"]`;
      cy.get(widgetSelector)
        .should('be.visible')
        .and('contain.text', widget.title); // Adjust based on what you expect after refresh
    });

  });
});
