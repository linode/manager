/**
 * @file Integration Tests for CloudPulse Linode Dashboard.
 */
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateCloudPulseJWEToken,
  mockGetCloudPulseDashboard,
  mockCreateCloudPulseMetrics,
  mockGetCloudPulseDashboards,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { ui } from 'support/ui';
import { widgetDetails } from 'support/constants/widgets';
import {
  accountFactory,
  cloudPulseMetricsResponseFactory,
  dashboardFactory,
  dashboardMetricFactory,
  kubeLinodeFactory,
  linodeFactory,
  regionFactory,
  widgetFactory,
} from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { extendRegion } from 'support/util/regions';
import { CloudPulseMetricsResponse } from '@linode/api-v4';
import { transformData } from 'src/features/CloudPulse/Utils/unitConversion';
import { getMetrics } from 'src/utilities/statMetrics';
import { generateRandomMetricsData } from 'support/util/cloudpulse';
import { Interception } from 'cypress/types/net-stubbing';

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
const expectedGranularityArray = ['Auto', '1 day', '1 hr', '5 min'];
const timeDurationToSelect = 'Last 24 Hours';

const { metrics, id, serviceType, dashboardName, region, resource } =
  widgetDetails.linode;

const dashboard = dashboardFactory.build({
  label: dashboardName,
  service_type: serviceType,
  widgets: metrics.map(({ title, yLabel, name, unit }) => {
    return widgetFactory.build({
      label: title,
      y_label: yLabel,
      metric: name,
      unit,
    });
  }),
});

const metricDefinitions = {
  data: metrics.map(({ title, name, unit }) =>
    dashboardMetricFactory.build({
      label: title,
      metric: name,
      unit,
    })
  ),
};

const mockLinode = linodeFactory.build({
  label: resource,
  id: kubeLinodeFactory.build().instance_id ?? undefined,
});

const mockAccount = accountFactory.build();
const mockRegion = extendRegion(
  regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-ord',
    label: 'Chicago, IL',
    country: 'us',
  })
);
const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

/**
 * `verifyWidgetValues` processes and verifies the metric values of a widget from the provided response payload.
 *
 * This method performs the following steps:
 * 1. Transforms the raw data from the response payload into a more manageable format using `transformData`.
 * 2. Extracts key metrics (average, last, and max) from the transformed data using `getMetrics`.
 * 3. Rounds these metrics to two decimal places for accuracy.
 * 4. Returns an object containing the rounded average, last, and max values for further verification or comparison.
 *
 * @param {CloudPulseMetricsResponse} responsePayload - The response payload containing metric data for a widget.
 * @returns {Object} An object with the rounded average, last, and max metric values.
 */
const getWidgetLegendRowValuesFromResponse = (
  responsePayload: CloudPulseMetricsResponse
) => {
  const data = transformData(responsePayload.data.result[0].values, 'Bytes');
  const { average, last, max } = getMetrics(data);
  const roundedAverage = Math.round(average * 100) / 100;
  const roundedLast = Math.round(last * 100) / 100;
  const roundedMax = Math.round(max * 100) / 100;
  return { average: roundedAverage, last: roundedLast, max: roundedMax };
};

describe('Integration Tests for Linode Dashboard ', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclp: { beta: true, enabled: true },
    });
    mockGetAccount(mockAccount); // Enables the account to have capability for Akamai Cloud Pulse
    mockGetLinodes([mockLinode]);
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices(serviceType).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard);
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetRegions([mockRegion]);
    mockGetUserPreferences({});

    // navigate to the cloudpulse page
    cy.visitWithLogin('monitor/cloudpulse');

    // Wait for the services and dashboard API calls to complete before proceeding
    cy.wait(['@fetchServices', '@fetchDashboard']);

    // Selecting a dashboard from the autocomplete input.
    ui.autocomplete
      .findByLabel('Select a Dashboard')
      .should('be.visible')
      .type(`${dashboardName}{enter}`)
      .should('be.visible');

    // Select a time duration from the autocomplete input.
    ui.autocomplete
      .findByLabel('Select a Time Duration')
      .should('be.visible')
      .type(`${timeDurationToSelect}{enter}`)
      .should('be.visible');

    // Select a region from the dropdown.
    ui.regionSelect.find().click().type(`${region}{enter}`);

    // Select a resource from the autocomplete input.
    ui.autocomplete
      .findByLabel('Select a Resource')
      .should('be.visible')
      .type(`${resource}{enter}`)
      .click();

    cy.findByText(resource).should('be.visible');
    // Wait for all metrics query requests to resolve.
    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);
  });

  it('should allow users to select their desired granularity and see the most recent data from the API reflected in the graph', () => {
    // validate the widget level granularity selection and its metrics
    metrics.forEach((testData) => {
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .should('be.visible')
        .find('h2')
        .should('have.text', `${testData.title} (${testData.unit.trim()})`);
      cy.get(widgetSelector)
        .should('be.visible')
        .within(() => {
          // check for all available granularity in popper
          ui.autocomplete
            .findByLabel('Select an Interval')
            .should('be.visible')
            .click();

          expectedGranularityArray.forEach((option) => {
            ui.autocompletePopper.findByTitle(option).should('exist');
          });

          mockCreateCloudPulseMetrics(
            serviceType,
            metricsAPIResponsePayload
          ).as('getGranularityMetrics');

          //find the interval component and select the expected granularity
          ui.autocomplete
            .findByLabel('Select an Interval')
            .should('be.visible')
            .type(`${testData.expectedGranularity}{enter}`); //type expected granularity

          //check if the API call is made correctly with time granularity value selected
          cy.wait('@getGranularityMetrics').then((interception) => {
            expect(interception)
              .to.have.property('response')
              .with.property('statusCode', 200);
            expect(testData.expectedGranularity).to.include(
              interception.request.body.time_granularity.value
            );
          });

          //validate the widget linegrah is present
          cy.findByTestId('linegraph-wrapper').within(() => {
            const expectedWidgetValues = getWidgetLegendRowValuesFromResponse(
              metricsAPIResponsePayload
            );
            cy.findByText(`${testData.title} (${testData.unit})`).should(
              'be.visible'
            );
            cy.get(`[data-qa-graph-column-title="Max"]`)
              .should('be.visible')
              .should(
                'have.text',
                `${expectedWidgetValues.max} ${testData.unit}`
              );

            cy.get(`[data-qa-graph-column-title="Avg"]`)
              .should('be.visible')
              .should(
                'have.text',
                `${expectedWidgetValues.average} ${testData.unit}`
              );

            cy.get(`[data-qa-graph-column-title="Last"]`)
              .should('be.visible')
              .should(
                'have.text',
                `${expectedWidgetValues.last} ${testData.unit}`
              );
          });
        });
    });
  });
  it('should allow users to select the desired aggregation and view the latest data from the API displayed in the graph', () => {
    metrics.forEach((testData) => {
      const widgetSelector = `[data-qa-widget="${testData.title}"]`;
      cy.get(widgetSelector)
        .should('be.visible')
        .within(() => {
          mockCreateCloudPulseMetrics(
            serviceType,
            metricsAPIResponsePayload
          ).as('getAggregationMetrics');

          //find the interval component and select the expected granularity
          ui.autocomplete
            .findByLabel('Select an Aggregate Function')
            .should('be.visible')
            .type(`${testData.expectedAggregation}{enter}`); //type expected granularity

          //check if the API call is made correctly with time granularity value selected
          cy.wait('@getAggregationMetrics').then((interception) => {
            expect(interception)
              .to.have.property('response')
              .with.property('statusCode', 200);
            expect(testData.expectedAggregation).to.equal(
              interception.request.body.aggregate_function
            );
          });

          //validate the widget linegrah is present
          cy.findByTestId('linegraph-wrapper').within(() => {
            const expectedWidgetValues = getWidgetLegendRowValuesFromResponse(
              metricsAPIResponsePayload
            );
            cy.findByText(`${testData.title} (${testData.unit})`).should(
              'be.visible'
            );
            cy.get(`[data-qa-graph-column-title="Max"]`)
              .should('be.visible')
              .should(
                'have.text',
                `${expectedWidgetValues.max} ${testData.unit}`
              );

            cy.get(`[data-qa-graph-column-title="Avg"]`)
              .should('be.visible')
              .should(
                'have.text',
                `${expectedWidgetValues.average} ${testData.unit}`
              );

            cy.get(`[data-qa-graph-column-title="Last"]`)
              .should('be.visible')
              .should(
                'have.text',
                `${expectedWidgetValues.last} ${testData.unit}`
              );
          });
        });
    });
  });
  it('should trigger the global refresh button and verify the corresponding network calls', () => {
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'refreshMetrics'
    );

    // click the global refresh button
    ui.button
      .findByAttribute('aria-label', 'Refresh Dashboard Metrics')
      .should('be.visible')
      .click();

    // validate the API calls are going with intended payload
    cy.get('@refreshMetrics.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;
        const { metric, relative_time_duration: timeRange } = requestPayload;
        const metricData = metrics.find(({ name }) => name === metric);

        if (!metricData) {
          throw new Error(
            `Unexpected metric name '${metric}' included in the outgoing refresh API request`
          );
        }
        expect(metric).to.equal(metricData.name);
        expect(timeRange).to.have.property('unit', 'hr');
        expect(timeRange).to.have.property('value', 24);
      });
  });

  it('should zoom in and out of all the widgets', () => {
    // do zoom in and zoom out test on all the widgets
    metrics.forEach((testData) => {
      cy.get(`[data-qa-widget="${testData.title}"]`).as('widget');
      cy.get('@widget')
        .should('be.visible')
        .within(() => {
          ui.button
            .findByAttribute('aria-label', 'Zoom In')
            .should('be.visible')
            .should('be.enabled')
            .click();
          cy.get('@widget').should('be.visible');
          cy.findByTestId('linegraph-wrapper').within(() => {
            const expectedWidgetValues = getWidgetLegendRowValuesFromResponse(
              metricsAPIResponsePayload
            );
            cy.findByText(`${testData.title} (${testData.unit})`).should(
              'be.visible'
            );
            cy.get(`[data-qa-graph-column-title="Max"]`)
              .should('be.visible')
              .should(
                'have.text',
                `${expectedWidgetValues.max} ${testData.unit}`
              );

            cy.get(`[data-qa-graph-column-title="Avg"]`)
              .should('be.visible')
              .should(
                'have.text',
                `${expectedWidgetValues.average} ${testData.unit}`
              );

            cy.get(`[data-qa-graph-column-title="Last"]`)
              .should('be.visible')
              .should(
                'have.text',
                `${expectedWidgetValues.last} ${testData.unit}`
              );
          });

          // click zoom out and validate the same
          ui.button
            .findByAttribute('aria-label', 'Zoom Out')
            .should('be.visible')
            .should('be.enabled')
            .scrollIntoView()
            .click({ force: true });
          cy.get('@widget').should('be.visible');
          cy.findByTestId('linegraph-wrapper').within(() => {
            const expectedWidgetValues = getWidgetLegendRowValuesFromResponse(
              metricsAPIResponsePayload
            );
            cy.findByText(`${testData.title} (${testData.unit})`).should(
              'be.visible'
            );
            cy.get(`[data-qa-graph-column-title="Max"]`)
              .should('be.visible')
              .should(
                'have.text',
                `${expectedWidgetValues.max} ${testData.unit}`
              );

            cy.get(`[data-qa-graph-column-title="Avg"]`)
              .should('be.visible')
              .should(
                'have.text',
                `${expectedWidgetValues.average} ${testData.unit}`
              );

            cy.get(`[data-qa-graph-column-title="Last"]`)
              .should('be.visible')
              .should(
                'have.text',
                `${expectedWidgetValues.last} ${testData.unit}`
              );
          });
        });
    });
  });
});
