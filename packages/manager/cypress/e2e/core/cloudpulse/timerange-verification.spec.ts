/* eslint-disable cypress/no-unnecessary-waiting */

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
  flagsFactory,
  widgetFactory,
} from 'src/factories';
import { formatDate } from 'src/utilities/formatDate';

import type { Database, DateTimeWithPreset } from '@linode/api-v4';
import type { Interception } from 'support/cypress-exports';

const formatter = "yyyy-MM-dd'T'HH:mm:ss'Z'";

const timeRanges = [
  { label: 'Last 30 minutes', unit: 'min', value: 30 },
  { label: 'Last 12 hours', unit: 'hr', value: 12 },
  { label: 'Last 30 days', unit: 'days', value: 30 },
  { label: 'Last 7 days', unit: 'days', value: 7 },
  { label: 'Last hour', unit: 'hr', value: 1 },
  { label: 'Last day', unit: 'days', value: 1 },
];

const mockRegion = regionFactory.build({
  capabilities: ['Managed Databases'],
  id: 'us-ord',
  label: 'Chicago, IL',
  monitors: {
    metrics: ['Managed Databases'],
    alerts: [],
  },
});

const { dashboardName, engine, id, metrics } = widgetDetails.dbaas;
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
// Profile timezone is set to 'UTC'
const mockProfile = profileFactory.build({
  timezone: 'UTC',
});
/**
 * Generates a date in Indian Standard Time (IST) based on a specified number of days offset,
 * hour, and minute. The function also provides individual date components such as day, hour,
 * minute, month, and AM/PM.
 *
 * @param {number} hour - The hour to set for the resulting date (0-23).
 * @param {number} [minute=0] - The minute to set for the resulting date (0-59). Defaults to 0.
 *
 * @returns {Object} - Returns an object containing:
 *   - `actualDate`: The formatted date and time in GMT (YYYY-MM-DD HH:mm).
 *   - `day`: The day of the month as a number.
 *   - `hour`: The hour in the 24-hour format as a number.
 *   - `minute`: The minute of the hour as a number.
 *   - `month`: The month of the year as a number.
 */
const getDateRangeInGMT = (
  hour: number,
  minute: number = 0,
  isStart: boolean = false,
  dayInput?: number // optional day input
) => {
  const now = DateTime.now().setZone('GMT');

  let targetDate: DateTime;

  if (isStart) {
    // Start of month or custom day
    targetDate = now.startOf('month').set({ hour, minute });
    if (dayInput) {
      targetDate = targetDate.set({ day: dayInput });
    }
  } else {
    // Current month, set hour/minute
    targetDate = now.set({ hour, minute });
    if (dayInput) {
      targetDate = targetDate.set({ day: dayInput });
    }
  }

  const actualDate = targetDate.toFormat('yyyy-LL-dd HH:mm');

  const previousMonthBase = now.minus({ months: 1 });

  return {
    actualDate,
    day: targetDate.day,
    hour: targetDate.hour,
    minute: targetDate.minute,
    month: targetDate.toFormat('LLLL'),
    year: targetDate.year,
    daysInMonth: targetDate.daysInMonth,
    previousMonth: previousMonthBase.toFormat('LLLL'),
    previousYear: previousMonthBase.year,
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

/*
 *
 * The tests in this spec frequently fail during specific dates and time periods
 * throughout the day and year. Because there are so many tests in this spec, the
 * timeouts and subsequent failures can delay test runs by several (45+) minutes
 * which frequently interferes with unrelated test runs.
 *
 * Other considerations:
 *
 * - Would unit tests or component tests be a better fit for this?
 *
 * - Are these tests adding any value? They fail frequently and the failures do
 *   not get reviewed. They do not seem to be protecting us from regressions.
 */
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
    mockAppendFeatureFlags(flagsFactory.build());
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

    cy.get('[aria-label="Content is loading"]', { timeout: 2000 }).should(
      'not.exist'
    );
    cy.wait([
      '@fetchServices',
      '@fetchDashboard',
      '@fetchPreferences',
      '@fetchDatabases',
    ]);
  });
  it('should implement and validate custom date/time picker for a specific date and time range', () => {
    // --- Generate start and end date/time in GMT ---

    const startDayOfMonth = 1;
    const endDayOfMonth = 3;

    const {
      actualDate: startActualDate,
      hour: startHour,
      minute: startMinute,
    } = getDateRangeInGMT(12, 15, true, startDayOfMonth);

    const {
      actualDate: endActualDate,
      hour: endHour,
      minute: endMinute,
    } = getDateRangeInGMT(12, 30, false, endDayOfMonth);

    // --- Open date/time picker and reset previous selection ---
    ui.button.findByTitle('Last hour').click();

    ui.button.findByTitle('Reset').should('be.visible').click();

    // --- Open date picker dialog and navigate to previous month ---

    cy.get('[role="dialog"]').within(() => {
      // --- Navigate to previous month ---
      cy.get('div[role="button"], button')
        .filter(':visible') // visible buttons only
        .first() // first button in the header should be "prev month"
        .click();

      // --- Select start and end day ---
      cy.findAllByText(startDayOfMonth).first().click();
      cy.findAllByText(endDayOfMonth).first().click();
    });
    // --- Select start time ---

    ui.button
      .findByAttribute('aria-label^', 'Choose time')
      .first()
      .should('be.visible', { timeout: 10000 }) // waits up to 10 seconds
      .as('timePickerButton');

    cy.get('@timePickerButton').scrollIntoView({ easing: 'linear' });

    cy.get('@timePickerButton', { timeout: 15000 }).wait(300).click();

    // Selects the start hour, minute, and meridiem (AM/PM) in the time picker.
    cy.get(`[aria-label="${startHour} hours"]`).click();

    cy.wait(1500);
    ui.button
      .findByAttribute('aria-label^', 'Choose time')
      .first()
      .should('be.visible', { timeout: 10000 })
      .as('timePickerButton');

    cy.get('@timePickerButton').scrollIntoView({ easing: 'linear' });

    cy.get('@timePickerButton', { timeout: 15000 }).wait(300).click();

    cy.get(`[aria-label="${startMinute} minutes"]`).click();

    ui.button
      .findByAttribute('aria-label^', 'Choose time')
      .first()
      .should('be.visible', { timeout: 10000 })
      .as('timePickerButton');

    cy.get('@timePickerButton').scrollIntoView({ easing: 'linear' });

    cy.get('@timePickerButton', { timeout: 15000 }).wait(300).click();

    cy.findByLabelText('Select meridiem')
      .as('startMeridiemSelect')
      .scrollIntoView();
    cy.get('@startMeridiemSelect').find('[aria-label="PM"]').click();

    // --- Select end time ---
    ui.button
      .findByAttribute('aria-label^', 'Choose time')
      .last()
      .should('be.visible', { timeout: 10000 })
      .as('timePickerButton');

    cy.get('@timePickerButton', { timeout: 15000 }).click();

    // Selects the start hour, minute, and meridiem (AM/PM) in the time picker.
    cy.findByLabelText('Select hours').scrollIntoView({
      duration: 500,
      easing: 'linear',
    });
    cy.get(`[aria-label="${endHour} hours"]`).click();

    cy.get('[aria-label^="Choose time"]')
      .last()
      .should('be.visible')
      .as('timePickerButton');

    cy.get('@timePickerButton', { timeout: 15000 }).wait(300).click();

    cy.get(`[aria-label="${endMinute} minutes"]`).click();

    cy.get('[aria-label^="Choose time"]')
      .last()
      .should('be.visible', { timeout: 10000 })
      .as('timePickerButton');

    cy.get('@timePickerButton', { timeout: 15000 }).wait(300).click();

    cy.findByLabelText('Select meridiem')
      .as('endMeridiemSelect')
      .scrollIntoView();
    cy.get('@endMeridiemSelect').find('[aria-label="PM"]').click();

    // --- Set timezone ---
    cy.findByPlaceholderText('Choose a Timezone').as('timezoneInput').clear();
    cy.get('@timezoneInput').type('(GMT +0:00) Greenwich Mean Time{enter}');

    // --- Apply date/time range ---
    cy.get('[data-qa-buttons="apply"]')
      .should('be.visible')
      .and('be.enabled')
      .click();

    // --- validate after apply ---
    cy.get('[aria-labelledby="start-date"]').should(
      'have.value',
      `${startActualDate} PM`
    );
    cy.get('[aria-labelledby="end-date"]').should(
      'have.value',
      `${endActualDate} PM`
    );

    ui.button.findByTitle('Cancel').and('be.enabled').click();

    // --- Select Node Type ---
    ui.autocomplete.findByLabel('Node Type').type('Primary{enter}');

    // --- Validate API requests triggered for the selected range ---
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
  });

  timeRanges.forEach((range) => {
    it(`Select and validate the functionality of the "${range.label}" preset from the "Time Range" dropdown`, () => {
      ui.button.findByTitle('Last hour').as('startDateInput');
      cy.get('@startDateInput').scrollIntoView();

      cy.get('@startDateInput').click();

      ui.button.findByTitle(range.label).click();

      cy.get(`[data-qa-preset="${range.label}"]`).should(
        'have.attr',
        'aria-selected',
        'true'
      );

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

    ui.button.findByTitle('Last hour').as('startDateInput');
    cy.get('@startDateInput').scrollIntoView();

    cy.get('@startDateInput').click();

    ui.button.findByTitle('Last month').click();

    cy.get('[data-qa-preset="Last month"]')
      .should('exist')
      .and('have.attr', 'aria-selected', 'true');

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

    ui.button.findByTitle('Last hour').as('startDateInput');
    cy.get('@startDateInput').scrollIntoView();

    cy.get('@startDateInput').click();

    ui.button.findByTitle('This month').click();

    cy.get('[data-qa-preset="This month"]')
      .should('exist')
      .and('have.attr', 'aria-selected', 'true');
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

  it('should not change the selected preset when a new preset selection is cancelled', () => {
    // open the time range picker
    ui.button.findByTitle('Last hour').as('timeRangeTrigger');
    cy.get('@timeRangeTrigger').click();

    // verify initial preset
    cy.get('[data-qa-preset="Last hour"]').should(
      'have.attr',
      'aria-selected',
      'true'
    );

    // select a different preset but cancel
    ui.button.findByTitle('Last month').click();
    ui.button.findByTitle('Cancel').should('be.visible').click();

    // reopen picker
    cy.get('@timeRangeTrigger').click();

    // original preset should remain selected
    cy.get('[data-qa-preset="Last hour"]').should(
      'have.attr',
      'aria-selected',
      'true'
    );
  });
});
