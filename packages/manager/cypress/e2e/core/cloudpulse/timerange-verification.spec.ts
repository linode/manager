/**
 * @file Integration Tests for CloudPulse Custom and Preset Verification
 */
import { profileFactory, regionFactory } from '@linode/utilities';
import { DateTime } from 'luxon';
import { widgetDetails } from 'support/constants/widgets';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockCreateCloudPulseJWEToken,
  mockCreateCloudPulseMetrics,
  mockGetCloudPulseDashboard,
  mockGetCloudPulseDashboards,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetProfile,
  mockGetUserPreferences,
} from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { generateRandomMetricsData } from 'support/util/cloudpulse';

import {
  accountFactory,
  cloudPulseMetricsResponseFactory,
  dashboardFactory,
  dashboardMetricFactory,
  databaseFactory,
  widgetFactory,
} from 'src/factories';
import { formatDate } from 'src/utilities/formatDate';

import type { Database, DateTimeWithPreset } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';
import type { Interception } from 'support/cypress-exports';

const formatter = "yyyy-MM-dd'T'HH:mm:ss'Z'";

const timeRanges = [
  { label: 'last 30 minutes', unit: 'min', value: 30 },
  { label: 'last 12 hours', unit: 'hr', value: 12 },
  { label: 'last 30 days', unit: 'days', value: 30 },
  { label: 'last 7 days', unit: 'days', value: 7 },
  { label: 'last hour', unit: 'hr', value: 1 },
  { label: 'last day', unit: 'days', value: 1 },
];

const mockRegion = regionFactory.build({
  capabilities: ['Managed Databases'],
  id: 'us-ord',
  label: 'Chicago, IL',
});

const flags: Partial<Flags> = {
  aclp: { beta: true, enabled: true },
  aclpResourceTypeMap: [
    {
      dimensionKey: 'cluster_id',
      maxResourceSelections: 10,
      serviceType: 'dbaas',
      supportedRegionIds: 'us-ord',
    },
  ],
};

const { dashboardName, engine, id, metrics, serviceType } = widgetDetails.dbaas;

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

const metricDefinitions = {
  data: metrics.map(({ name, title, unit }) =>
    dashboardMetricFactory.build({
      label: title,
      metric: name,
      unit,
    })
  ),
};

const mockAccount = accountFactory.build();

const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData('Last 30 Days', '1 day'),
});

const databaseMock: Database = databaseFactory.build({
  region: mockRegion.id,
  type: engine,
});
const mockProfile = profileFactory.build({
  timezone: 'UTC',
});
/**
 * Generates a date in Indian Standard Time (IST) based on a specified number of days offset,
 * hour, and minute. The function also provides individual date components such as day, hour,
 * minute, month, and AM/PM.
 *
 * @param {number} daysOffset - The number of days to adjust from the current date. Positive
 *                               values give a future date, negative values give a past date.
 * @param {number} hour - The hour to set for the resulting date (0-23).
 * @param {number} [minute=0] - The minute to set for the resulting date (0-59). Defaults to 0.
 *
 * @returns {Object} - Returns an object containing:
 *   - `actualDate`: The formatted date and time in IST (YYYY-MM-DD HH:mm).
 *   - `day`: The day of the month as a number.
 *   - `hour`: The hour in the 24-hour format as a number.
 *   - `minute`: The minute of the hour as a number.
 *   - `month`: The month of the year as a number.
 */
const getDateRangeInGMT = (
  hour: number,
  minute: number = 0,
  isStart: boolean = false
) => {
  const now = DateTime.now().setZone('GMT'); // Set the timezone to GMT
  const targetDate = isStart
    ? now.startOf('month').set({ hour, minute }).setZone('GMT')
    : now.set({ hour, minute }).setZone('GMT');
  const actualDate = targetDate.setZone('GMT').toFormat('yyyy-LL-dd HH:mm');

  return {
    actualDate,
    day: targetDate.day,
    hour: targetDate.hour,
    minute: targetDate.minute,
    month: targetDate.month,
  };
};

/**
 * This function calculates the start of the current month and the current date and time,
 * adjusted by subtracting 5 hours and 30 minutes, and returns them in the ISO 8601 format (UTC).
 *
 * @returns {{start: string, end: string}} - The start and end dates of the current month in ISO 8601 format.
 */

const getThisMonthRange = (): DateTimeWithPreset => {
  const nowUtc = DateTime.utc(); // Current time in UTC

  const startOfMonthUtc = nowUtc.startOf('month'); // Start of current month in UTC

  return {
    start: startOfMonthUtc.toFormat(formatter),
    end: nowUtc.toFormat(formatter),
  };
};
const getLastMonthRange = (): DateTimeWithPreset => {
  // Get current time in UTC
  const now = DateTime.utc();

  // Get last month in UTC
  const lastMonth = now.minus({ months: 1 });

  // Get start and end of last month in UTC and format
  const start = lastMonth.startOf('month').toFormat(formatter);
  const end = lastMonth.endOf('month').toFormat(formatter);

  return {
    start,
    end,
  };
};

const convertToGmt = (dateStr: string): string => {
  return DateTime.fromISO(dateStr.replace(' ', 'T')).toFormat(
    'yyyy-MM-dd HH:mm'
  );
};
const formatToUtcDateTime = (dateStr: string): string => {
  return DateTime.fromISO(dateStr)
    .toUTC() // 🌍 keep it in UTC
    .toFormat('yyyy-MM-dd HH:mm');
};

// It is going to be modified
describe('Integration tests for verifying Cloudpulse custom and preset configurations', () => {
  /*
   * - Mocks user preferences for dashboard details (dashboard, engine, resources, and region).
   * - Simulates loading test data without real API calls.
   *
   * - Creates a mock profile with timezone set to GMT ('Etc/GMT').
   * - Ensures consistency in time-based functionality and API requests.
   *
   * - Confirms accurate calculation of "This Month" and "Last Month" time ranges.
   * - Verifies start and end dates are correctly computed and returned in ISO 8601 GMT format.
   *
   * - Confirms functionality of preset and relative time ranges, ensuring correct time range picker behavior.
   * - Verifies correct custom date and time range selection.
   *
   * - Ensures start and end date pickers are visible, interacts with them, and asserts correct date values in "PM" format.
   *
   * - Waits for 4 `@getMetrics` API calls, verifies correct payload with `start` and `end` times.
   * - Ensures times are correctly converted to GMT and match `startActualDate` and `endActualDate`.
   */

  beforeEach(() => {
    cy.viewport(1280, 720);
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions.data);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetCloudPulseDashboard(id, dashboard);
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetRegions([mockRegion]);
    mockGetProfile(mockProfile);
    mockGetUserPreferences({
      aclpPreference: {
        dashboardId: id,
        engine: engine.toLowerCase(),
        region: mockRegion.id,
        resources: ['1'],
      },
    }).as('fetchPreferences');
    mockGetDatabases([databaseMock]).as('fetchDatabases');

    cy.visitWithLogin('/metrics');
    cy.wait([
      '@fetchServices',
      '@fetchDashboard',
      '@fetchPreferences',
      '@fetchDatabases',
    ]);
  });

  it('should implement and validate custom date/time picker for a specific date and time range', () => {
    // --- Generate start and end date/time in GMT ---
    const {
      actualDate: startActualDate,
      day: startDay,
      hour: startHour,
      minute: startMinute,
    } = getDateRangeInGMT(12, 15, true);

    const {
      actualDate: endActualDate,
      day: endDay,
      hour: endHour,
      minute: endMinute,
    } = getDateRangeInGMT(12, 30);

    // --- Select start date ---
    cy.get('[aria-labelledby="start-date"]').as('startDateInput');
    cy.get('@startDateInput').click();
    cy.get('@startDateInput').clear();

    cy.findAllByText(startDay).first().click({ force: true });

    // --- Select end date ---
    cy.findAllByText(endDay).first().click({ force: true });

    // --- Select start time ---
    cy.get('[data-testid="ClockIcon"]')
      .first()
      .closest('button')
      .click({ force: true });

    cy.findByLabelText('Select hours').as('startHourSelect').scrollIntoView();
    cy.get('@startHourSelect')
      .find(`[aria-label="${startHour} hours"]`)
      .click();

    cy.findByLabelText('Select minutes')
      .as('startMinuteSelect')
      .scrollIntoView();
    cy.get('@startMinuteSelect')
      .find(`[aria-label="${startMinute} minutes"]`)
      .click();

    cy.findByLabelText('Select meridiem')
      .as('startMeridiemSelect')
      .scrollIntoView();
    cy.get('@startMeridiemSelect').find('[aria-label="PM"]').click();

    // --- Select end time ---
    cy.get('[data-testid="ClockIcon"]')
      .last()
      .closest('button')
      .click({ force: true });

    cy.findByLabelText('Select hours').as('endHourSelect').scrollIntoView();
    cy.get('@endHourSelect').find(`[aria-label="${endHour} hours"]`).click();

    cy.findByLabelText('Select minutes').as('endMinuteSelect').scrollIntoView();
    cy.get('@endMinuteSelect')
      .find(`[aria-label="${endMinute} minutes"]`)
      .click();

    cy.findByLabelText('Select meridiem')
      .as('endMeridiemSelect')
      .scrollIntoView();
    cy.get('@endMeridiemSelect').find('[aria-label="PM"]').click();

    // --- Set timezone ---
    cy.findByPlaceholderText('Choose a Timezone').clear();
    cy.findByPlaceholderText('Choose a Timezone').type(
      '(GMT +0:00) Greenwich Mean Time{enter}',
      { force: true }
    );

    // --- Apply date/time range ---
    cy.get('[data-qa-buttons="apply"]')
      .should('be.visible')
      .and('be.enabled')
      .click();

    // --- Re-validate after apply ---
    cy.get('[aria-labelledby="start-date"]').should(
      'have.value',
      `${startActualDate} PM`
    );
    cy.get('[aria-labelledby="end-date"]').should(
      'have.value',
      `${endActualDate} PM`
    );

    // --- Select Node Type ---
    ui.autocomplete.findByLabel('Node Type').type('Primary{enter}');

    // --- Validate API requests ---
    cy.wait(Array(4).fill('@getMetrics'));
    cy.get('@getMetrics.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const {
          request: { body },
        } = xhr as Interception;
        expect(formatToUtcDateTime(body.absolute_time_duration.start)).to.equal(
          convertToGmt(startActualDate)
        );
        expect(formatToUtcDateTime(body.absolute_time_duration.end)).to.equal(
          convertToGmt(endActualDate)
        );
      });

    // --- Test Time Range Presets ---
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getPresets'
    );

    cy.get('@startDateInput').click();
    ui.button.findByTitle('last 30 days').click();

    cy.get('[data-qa-buttons="apply"]')
      .should('be.visible')
      .and('be.enabled')
      .click();

    cy.get('@getPresets.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const {
          request: { body },
        } = xhr as Interception;
        expect(body).to.have.nested.property(
          'relative_time_duration.unit',
          'days'
        );
        expect(body).to.have.nested.property(
          'relative_time_duration.value',
          30
        );
      });
  });

  timeRanges.forEach((range) => {
    it(`Select and validate the functionality of the "${range.label}" preset from the "Time Range" dropdown`, () => {
      cy.get('[aria-labelledby="start-date"]').as('startDateInput');
      cy.get('@startDateInput').click();
      ui.button.findByTitle(range.label).click();
      cy.get('[data-qa-buttons="apply"]')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.autocomplete
        .findByLabel('Node Type')
        .should('be.visible')
        .type('Primary{enter}');

      cy.wait(Array(4).fill('@getMetrics'));

      cy.get('@getMetrics.all')
        .should('have.length', 4)
        .each((xhr: unknown) => {
          const interception = xhr as Interception;
          const { body: requestPayload } = interception.request;
          expect(requestPayload.relative_time_duration.unit).to.equal(
            range.unit
          );
          expect(requestPayload.relative_time_duration.value).to.equal(
            range.value
          );
        });
    });
  });

  it('Select the "Last Month" preset from the "Time Range" dropdown and verify its functionality.', () => {
    const { end, start } = getLastMonthRange();

    cy.get('[aria-labelledby="start-date"]').as('startDateInput');
    cy.get('@startDateInput').click();
    ui.button.findByTitle('last month').click();
    cy.get('[data-qa-buttons="apply"]')
      .should('be.visible')
      .should('be.enabled')
      .click();
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type('Primary{enter}');

    cy.wait(Array(4).fill('@getMetrics'));

    cy.get('@getMetrics.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;

        expect(requestPayload.absolute_time_duration.start).to.equal(start);
        expect(requestPayload.absolute_time_duration.end).to.equal(end);
      });
  });

  it('Select the "This Month" preset from the "Time Range" dropdown and verify its functionality.', () => {
    const { end, start } = getThisMonthRange();

    cy.get('[aria-labelledby="start-date"]').as('startDateInput');
    cy.get('@startDateInput').click();
    ui.button.findByTitle('this month').click();
    cy.get('[data-qa-buttons="apply"]')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type('Primary{enter}');

    cy.wait(Array(4).fill('@getMetrics'));
    cy.get('@getMetrics.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;

        expect(requestPayload.absolute_time_duration.start).to.equal(start);
        expect(
          formatDate(requestPayload.absolute_time_duration.end, {
            format: 'yyyy-MM-dd hh:mm',
          })
        ).to.equal(formatDate(end, { format: 'yyyy-MM-dd hh:mm' }));
      });
  });
});
