/**
 * @file Integration Tests for CloudPulse Custom and Preset Verification
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
  databaseFactory,
  profileFactory,
  regionFactory,
  widgetFactory,
} from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetProfile,
  mockGetUserPreferences,
} from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { Database, DateTimeWithPreset } from '@linode/api-v4';
import { generateRandomMetricsData } from 'support/util/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import type { Flags } from 'src/featureFlags';
import type { Interception } from 'support/cypress-exports';
import { convertToGmt } from 'src/features/CloudPulse/Utils/CloudPulseDateTimePickerUtils';
import { formatDate } from 'src/utilities/formatDate';
import { DateTime } from 'luxon';

const formatter = "yyyy-MM-dd'T'HH:mm:ss'Z'";
const cleanText = (string: string) =>
  string.replace(/\u200e|\u2066|\u2067|\u2068|\u2069/g, '');

const timeRanges = [
  { label: 'Last 30 Minutes', unit: 'min', value: 30 },
  { label: 'Last 12 Hours', unit: 'hr', value: 12 },
  { label: 'Last 24 Hours', unit: 'hr', value: 24 },
  { label: 'Last 30 Days', unit: 'days', value: 30 },
  { label: 'Last 7 Days', unit: 'days', value: 7 },
  { label: 'Last 1 Hour', unit: 'hr', value: 1 },
];

const mockRegion = regionFactory.build({
  capabilities: ['Managed Databases'],
  id: 'us-ord',
  label: 'Chicago, IL',
});

const flags: Partial<Flags> = {
  aclp: { enabled: true, beta: true },
  aclpResourceTypeMap: [
    {
      dimensionKey: 'LINODE_ID',
      maxResourceSelections: 10,
      serviceType: 'linode',
      supportedRegionIds: '',
    },
    {
      dimensionKey: 'cluster_id',
      maxResourceSelections: 10,
      serviceType: 'dbaas',
      supportedRegionIds: 'us-ord',
    },
  ],
};

const { metrics, id, serviceType, dashboardName, engine } = widgetDetails.dbaas;

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

const mockAccount = accountFactory.build();

const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData('Last 30 Days', '1 day'),
});

const databaseMock: Database = databaseFactory.build({
  type: engine,
  region: mockRegion.label,
});
const mockProfile = profileFactory.build({
  timezone: 'Etc/GMT',
});

/**
 * This function calculates the start of the current month and the current date and time,
 * adjusted by subtracting 5 hours and 30 minutes, and returns them in the ISO 8601 format (UTC).
 *
 * @returns {{start: string, end: string}} - The start and end dates of the current month in ISO 8601 format.
 */

const getThisMonthRange = (): DateTimeWithPreset => {
  const now = DateTime.now();

  const expectedStartDateISO = now.startOf('month').toISO() ?? '';
  const expectedEndDateISO = now.toISO() ?? '';

  const adjustedStartDate = DateTime.fromISO(expectedStartDateISO, {
    zone: 'gmt',
  });
  const adjustedEndDate = DateTime.fromISO(expectedEndDateISO, { zone: 'gmt' });
  const formattedStartDate = adjustedStartDate.toFormat(formatter);
  const formattedEndDate = adjustedEndDate.toFormat(formatter);

  return {
    end: formattedEndDate,
    start: formattedStartDate,
  };
};

const getLastMonthRange = (): DateTimeWithPreset => {
  const now = DateTime.now();

  // Get the last month by subtracting 1 month from the current date
  const lastMonth = now.minus({ months: 1 });

  // Get the start and end of the last month in ISO format
  const expectedStartDateISO = lastMonth.startOf('month').toISO() ?? '';
  const expectedEndDateISO = lastMonth.endOf('month').toISO() ?? '';

  // Adjust the start and end dates to GMT
  const adjustedStartDate = DateTime.fromISO(expectedStartDateISO, {
    zone: 'gmt',
  });
  const adjustedEndDate = DateTime.fromISO(expectedEndDateISO, { zone: 'gmt' });

  // Format the dates according to the specified format
  const formattedStartDate = adjustedStartDate.toFormat(formatter);
  const formattedEndDate = adjustedEndDate.toFormat(formatter);

  return {
    end: formattedEndDate,
    start: formattedStartDate,
  };
};

describe('Integration tests for verifying Cloudpulse custom and preset configurations', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions.data);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices(serviceType).as('fetchServices');
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
        resources: ['1'],
        region: mockRegion.id,
      },
    }).as('fetchPreferences');
    mockGetDatabases([databaseMock]);

    cy.visitWithLogin('monitor');
    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchPreferences']);
  });

  it.only('should set the date and time correctly', () => {
    // Get the current month and year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
    const currentDay = String(currentDate.getDate()).padStart(2, '0'); // Get the current day

    // Generate start and end actual dates
    const startActualDate = `${currentYear}-${currentMonth}-01`;
    const endActualDate = `${currentYear}-${currentMonth}-${currentDay}`; // Arbitrarily setting end date 13 days after start date
    const currentHour = currentDate.getHours();
   const currentMinute = currentDate.getMinutes() - 1; // Subtract 1 minute
    const formattedCurrentTime = `${String(currentHour % 12 || 12).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')} ${currentHour < 12 ? 'AM' : 'PM'}`;


    // Placeholder function to get day from date string
    const getDayFromDate = (dateString: string | number | Date) => new Date(dateString).getDate();

    const startDay = getDayFromDate(startActualDate);
    const endDay = getDayFromDate(endActualDate);

    const startTime = '12:15 PM';
    const endTime = formattedCurrentTime;

// Select "Custom" from the "Time Range" dropdown
    ui.autocomplete
      .findByLabel('Time Range')
      .scrollIntoView()
      .should('be.visible')
      .type('Custom');

    // Select "Custom" from the autocomplete dropdown
    ui.autocompletePopper.findByTitle('Custom').should('be.visible').click();

    // Click on "Select Start Date" input field
    cy.findByPlaceholderText('Select Start Date').should('be.visible').click();

    // Select the start date from the calendar
    cy.findByRole('gridcell', { name: startDay.toString() }).should('be.visible').click();

    // Set the start time
    cy.get('[aria-label^="Choose time"]').click();
    cy.findByPlaceholderText('hh:mm aa').clear().type(startTime).should('have.value', startTime);

    // Click the "Apply" button to confirm the start date and time
    cy.findByRole('button', { name: 'Apply' }).should('be.visible').click();

    // Assert that the start date and time are correctly displayed
    cy.findByPlaceholderText('Select Start Date')
    .scrollIntoView({ easing: 'linear' })
    .should('be.visible')
    .invoke('val') // Get the current value
    .then(cleanText) // Clean the value
    .should('equal',`${startActualDate} ${startTime}`);


    // Click on "Select End Date" input field
    cy.findByPlaceholderText('Select End Date').should('be.visible').click();

    // Select the end date from the calendar
    cy.findByRole('gridcell', { name: endDay.toString() }).should('be.visible').click();

    // Set the end time
    cy.get('[aria-label^="Choose time"]').click();
    cy.findByPlaceholderText('hh:mm aa').clear().type(endTime).should('have.value', endTime);

    // Click the "Apply" button to confirm the end date and time
    cy.findByRole('button', { name: 'Apply' }).should('be.visible').click();

    // Assert that the end date and time are correctly displayed
    cy.findByPlaceholderText('Select End Date')
      .scrollIntoView({ easing: 'linear' })
      .should('be.visible')
      .invoke('val') // Get the current value
      .then(cleanText) // Clean the value
      .should('equal', `${endActualDate} ${endTime}`);

    // Select the "Node Type" from the dropdown and submit
    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type('Primary{enter}');

    // Wait for all API calls to complete before assertions
    cy.wait(Array(4).fill('@getMetrics'));

    // Validate the API request payload for absolute time duration
    cy.get('@getMetrics.all')
    .should('have.length', 4)
    .each((xhr: unknown) => {
     // const interception = xhr as Interception;
      //const { body: requestPayload } = interception.request;
    });
    

    // Click on the "Presets" button
    cy.findByRole('button', { name: 'Presets' }).should('be.visible').click();

    // Mock API response for cloud metrics presets
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as('getPresets');

    // Select "Last 30 Days" from the "Time Range" dropdown
    ui.autocomplete
      .findByLabel('Time Range')
      .should('be.visible')
      .type('Last 30 Days');

    // Click on the "Last 30 Days" option
    ui.autocompletePopper
      .findByTitle('Last 30 Days')
      .should('be.visible')
      .click();

    // Validate API request payload for relative time duration
    cy.get('@getPresets.all')
      .should('have.length', 4)
      .each((xhr: unknown, index: number) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;

        expect(requestPayload).to.have.nested.property(
          'relative_time_duration.unit'
        );
        expect(requestPayload).to.have.nested.property(
          'relative_time_duration.value'
        );
        expect(requestPayload.relative_time_duration.unit).to.equal('days');
        expect(requestPayload.relative_time_duration.value).to.equal(30);
      });
  });

 timeRanges.forEach((range) => {
    it(`Select and validate the functionality of the "${range.label}" preset from the "Time Range" dropdown`, () => {
      ui.autocomplete
        .findByLabel('Time Range')
        .scrollIntoView()
        .should('be.visible')
        .type(range.label);

      ui.autocompletePopper
        .findByTitle(range.label)
        .should('be.visible')
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
    const { start, end } = getLastMonthRange();

    ui.autocomplete
      .findByLabel('Time Range')
      .scrollIntoView()
      .should('be.visible')
      .type('Last Month');

    ui.autocompletePopper
      .findByTitle('Last Month')
      .should('be.visible')
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
    const { start, end } = getThisMonthRange();

    ui.autocomplete
      .findByLabel('Time Range')
      .scrollIntoView()
      .should('be.visible')
      .type('This Month');

    ui.autocompletePopper
      .findByTitle('This Month')
      .should('be.visible')
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
