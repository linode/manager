import {
  selectTimeRange,
  validateWidgetTitle,
  setGranularity,
  setAggregation,
  verifyGranularity,
  verifyAggregation,
  checkZoomActions,
  selectAndVerifyResource,
  resource,
} from 'support/util/cloudpulse';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { interceptCloudPulseServices, interceptMetricsRequests ,mockJWSToken,mockLinodeDashboardServicesResponse} from 'support/intercepts/cloudpulseAPIHandler';
import { ui } from 'support/ui';
export const actualRelativeTimeDuration = timeRange.Last30Minutes;
import { timeRange, widgetDetails, timeUnit, granularity } from 'support/constants/widget-service';
import {
  interceptCreateMetrics,
  interceptGetDashboards,
  interceptGetMetricDefinitions,
} from 'support/intercepts/cloudpulseAPIHandler';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { createMetricResponse } from '@src/factories/widgetFactory'
import type { Flags } from 'src/featureFlags';
import { accountFactory ,kubeLinodeFactory,linodeFactory} from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetLinodes } from 'support/intercepts/linodes';

 const linodeWidgets = widgetDetails.linode;
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
const mockKubeLinode = kubeLinodeFactory.build();

const mockLinode = linodeFactory.build({
  label:"test1",
  id: mockKubeLinode.instance_id ?? undefined,
});

describe('Dashboard Widget Verification Tests', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclp: makeFeatureFlagData<Flags['aclp']>({ beta: true, enabled: true }),
    });
    
    mockGetFeatureFlagClientstream();
    mockGetLinodes([mockLinode]).as('getLinodes');
    interceptGetMetricDefinitions().as('dashboardMetricsData');
    interceptGetDashboards().as('dashboard');
    interceptCloudPulseServices().as('services');
    mockLinodeDashboardServicesResponse();
    mockJWSToken();
    const mockAccount = accountFactory.build();
    mockGetAccount(mockAccount).as('getAccount'); // this enables the account to have capability for Akamai Cloud Pulse
    cy.visitWithLogin('monitor/cloudpulse');
    const responsePayload = createMetricResponse(actualRelativeTimeDuration, granularity.Min5);
    interceptCreateMetrics(responsePayload).as('metricAPI');
     });
  it.only(`should set available granularity of the all the widget`, () => {
    linodeWidgets.forEach((testData) => {
      setGranularity(testData.title, testData.expectedGranularity);
    });
  });
  it(`should verify the title of the  widget`, () => {
    linodeWidgets.forEach((testData) => {
      validateWidgetTitle(testData.title);
    });
  });
  it(`should set available aggregation of the all the widget`, () => {
    linodeWidgets.forEach((testData) => {
      setAggregation(testData.title, testData.expectedAggregation);
    });
  });
  it(`should verify available granularity  of the widget`, () => {
    linodeWidgets.forEach((testData) => {
      verifyGranularity(testData.title, testData.expectedGranularityArray);
    });
  });

  it(`should verify available aggregation  of the widget`, () => {
    linodeWidgets.forEach((testData) => {
      verifyAggregation(testData.title, testData.expectedAggregationArray);
    });
  });
  it(`should zoom in and out of the all the widget`, () => {
    linodeWidgets.forEach((testData) => {
      checkZoomActions(testData.title);
    });
  });

  it('should apply global refresh button and verify network calls', () => {
    ui.cloudpulse.findRefreshIcon().click();
    interceptMetricsRequests();
    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']).then((interceptions) => {
      const interceptionsArray = Array.isArray(interceptions) ? interceptions : [interceptions];

      interceptionsArray.forEach((interception) => {
        const { body: requestPayload } = interception.request;
        const metric = requestPayload.metric;
        const metricData = linodeWidgets.find((data) => data.name === metric);

        if (!metricData) {
          throw new Error(`Unknown metric: ${metric}`);
        }
        const granularity = requestPayload['time_granularity'];
        const currentGranularity = granularity ? `${granularity.value} ${granularity.unit}` : '';
        const durationUnit = requestPayload.relative_time_duration.unit.toLowerCase();
        const durationValue = requestPayload.relative_time_duration.value;
        const currentRelativeTimeDuration = durationUnit in timeUnit ? 'Last' + durationValue + timeUnit[durationUnit as keyof typeof timeUnit] : '';
        expect(requestPayload.aggregate_function).to.equal(metricData.expectedAggregation);
        expect(currentRelativeTimeDuration).to.containIgnoreSpaces(actualRelativeTimeDuration);
        expect(requestPayload.metric).to.equal(metricData.name);
        expect(currentGranularity).to.equal(metricData.expectedGranularity);
      });
    });
  });

});


