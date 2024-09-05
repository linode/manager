import {
  navigateToCloudpulse,
  selectTimeRange,
  cloudpulseTestData,
  validateWidgetTitle,
  setGranularity,
  setAggregation,
  verifyGranularity,
  verifyAggregation,
  verifyZoomInOut,
  applyGlobalRefresh,
} from 'support/util/cloudpulse';
import { timeUnit } from 'support/constants/time';
import { interceptMetricsRequests } from 'support/intercepts/cloudpulseAPIHandler';
import { timeRange } from 'support/constants/timerange';
export const actualRelativeTimeDuration = timeRange.Last30Minutes;

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

describe('Dashboard Widget Verification Tests', () => {
  beforeEach(() => {
    navigateToCloudpulse();
    selectTimeRange(actualRelativeTimeDuration);
  });

  it(`should verify the title of the  widget`, () => {
    cloudpulseTestData.forEach((testData) => {
      validateWidgetTitle(testData.title);
    });
  });
  it(`should set available granularity of the all the widget`, () => {
    cloudpulseTestData.forEach((testData) => {
      setGranularity(testData.title, testData.expectedGranularity);
    });
  });
  it(`should set available aggregation of the all the widget`, () => {
    cloudpulseTestData.forEach((testData) => {
      setAggregation(testData.title, testData.expectedAggregation);
    });
  });
  it(`should verify available granularity  of the widget`, () => {
    cloudpulseTestData.forEach((testData) => {
      verifyGranularity(testData.title, testData.expectedGranularityArray);
    });
  });

  it(`should verify available aggregation  of the widget`, () => {
    cloudpulseTestData.forEach((testData) => {
      verifyAggregation(testData.title, testData.expectedAggregationArray);
    });
  });
  it(`should zoom in and out of the all the widget`, () => {
    cloudpulseTestData.forEach((testData) => {
      verifyZoomInOut(testData.title);
    });
  });
  it('should apply global refresh button and verify network calls', () => {
    applyGlobalRefresh();

    interceptMetricsRequests().then((xhrArray) => {
      xhrArray.forEach((xhr) => {
        const { body: requestPayload } = xhr.request;
        const metric = requestPayload.metric;
        const metricData = cloudpulseTestData.find(
          (data) => data.name === metric
        );

        if (!metricData) {
          throw new Error(`Unknown metric: ${metric}`);
        }

        const granularity = requestPayload['time_granularity'];
        const currentGranularity = granularity
          ? granularity.value + granularity.unit
          : '';

        const durationUnit = requestPayload.relative_time_duration.unit.toLowerCase();
        const durationValue = requestPayload.relative_time_duration.value;
        const currentRelativeTimeDuration =
          durationUnit in timeUnit
            ? 'Last' +
              durationValue +
              timeUnit[durationUnit as keyof typeof timeUnit]
            : '';

        // Assertions
        expect(requestPayload.aggregate_function).to.equal(
          metricData.expectedAggregation
        );
        expect(currentRelativeTimeDuration).to.containIgnoreSpaces(
          actualRelativeTimeDuration
        );
        expect(currentGranularity).to.containIgnoreSpaces(
          metricData.expectedGranularity
        );
        expect(requestPayload.metric).to.containIgnoreSpaces(metricData.name);
      });
    });
  });
});
