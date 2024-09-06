import {
  selectTimeRange,
  validateWidgetTitle,
  setGranularity,
  setAggregation,
  verifyGranularity,
  verifyAggregation,
  checkZoomActions,
  performGlobalRefresh,
  initializeMockUserData,
} from 'support/util/cloudpulse';
import { timeUnit } from 'support/constants/time';
import { interceptMetricsRequests} from 'support/intercepts/cloudpulseAPIHandler';
import { timeRange } from 'support/constants/timerange';
export const actualRelativeTimeDuration = timeRange.Last30Minutes;
import { widgetDetails } from 'support/util/widgetService';

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
describe('Dashboard Widget Verification Tests', () => {
  beforeEach(() => {
    initializeMockUserData();
    selectTimeRange(actualRelativeTimeDuration);
  });
  it(`should set available granularity of the all the widget`, () => {
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
    performGlobalRefresh();
    interceptMetricsRequests().then((xhrArray) => {
      xhrArray.forEach((xhr) => {
        const { body: requestPayload } = xhr.request;
        const metric = requestPayload.metric;
        const metricData = linodeWidgets.find(
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

