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
  regionFactory,
  widgetFactory,
} from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { Database } from '@linode/api-v4';
import { generateRandomMetricsData } from 'support/util/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import type { Flags } from 'src/featureFlags';
import { Interception } from 'cypress/types/net-stubbing';
import { DateTime } from 'luxon';
import { convertToGmt } from 'src/features/CloudPulse/Utils/CloudPulseDateTimePickerUtils';

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

const {
  metrics,
  id,
  serviceType,
  dashboardName,
  engine,
  nodeType,
} = widgetDetails.dbaas;

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

const timezone = 'Asia/Kolkata';

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
 *   - `ampm`: The AM/PM designation of the time (either 'AM' or 'PM').
 */
const getDateRangeInIST = (
  daysOffset: number,
  hour: number,
  minute: number = 0
) => {
  const now = DateTime.now().setZone(timezone);
  const targetDate = now
    .startOf('month')
    .plus({ days: daysOffset })
    .set({ hour, minute });

  const actualDate = targetDate.toFormat('yyyy-LL-dd HH:mm');
  return {
    actualDate,
    day: targetDate.day,
    hour: targetDate.hour,
    minute: targetDate.minute,
    month: targetDate.month,
    ampm: targetDate.toFormat('a'),
  };
};

/**
 * This function calculates the start and end of the previous month,
 * adjusted by subtracting 5 hours and 30 minutes, and returns them
 * in the ISO 8601 format (UTC).
 *
 * @returns {{start: string, end: string}} - The start and end dates of the previous month in ISO 8601 format.
 */
const getLastMonthRange = (): { start: string; end: string } => {
  const now = DateTime.now().setZone(timezone);
  const lastMonth = now.minus({ months: 1 });

  const expectedStartDateISO = lastMonth.startOf('month').toISO() ?? '';
  const expectedEndDateISO = lastMonth.endOf('month').toISO() ?? '';

  const adjustedStartDate = DateTime.fromISO(expectedStartDateISO, {
    zone: 'gmt',
  });
  const adjustedEndDate = DateTime.fromISO(expectedEndDateISO, { zone: 'gmt' });

  const formattedStartDate = adjustedStartDate.toFormat(
    "yyyy-MM-dd'T'HH:mm:ss'Z'"
  );
  const formattedEndDate = adjustedEndDate.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");

  return {
    start: formattedStartDate,
    end: formattedEndDate,
  };
};

/**
 * This function calculates the start of the current month and the current date and time,
 * adjusted by subtracting 5 hours and 30 minutes, and returns them in the ISO 8601 format (UTC).
 *
 * @returns {{start: string, end: string}} - The start and end dates of the current month in ISO 8601 format.
 */
const getThisMonthRange = (): { start: string; end: string } => {
  const now = DateTime.now().setZone(timezone);

  const expectedStartDateISO = now.startOf('month').toISO() ?? '';
  const expectedEndDateISO = now.toISO() ?? '';

  const adjustedStartDate = DateTime.fromISO(expectedStartDateISO, {
    zone: 'gmt',
  });
  const adjustedEndDate = DateTime.fromISO(expectedEndDateISO, { zone: 'gmt' });

  const formattedStartDate = adjustedStartDate.toFormat(
    "yyyy-MM-dd'T'HH:mm:ss'Z'"
  );
  const formattedEndDate = adjustedEndDate.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");

  return {
    start: formattedStartDate,
    end: formattedEndDate,
  };
};

describe('Integration Tests for DBaaS Dashboard', () => {
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
    mockGetUserPreferences({
      aclpPreference: {
        dashboardId: id,
        engine: engine.toLowerCase(),
        resources: ['1'],
        region: mockRegion.id,
      },
    }).as('fetchPreferences');
    mockGetDatabases([databaseMock]).as('getDatabases');

    cy.visitWithLogin('monitor');
    cy.wait('@fetchPreferences');
  });

  it.only('Implement and validate the functionality of the custom date and time picker for selecting a specific date and time range', () => {
    const startDate = getDateRangeInIST(0, 12, 15);
    const endDate = getDateRangeInIST(25, 1, 15);

    ui.autocomplete
      .findByLabel('Time Range')
      .scrollIntoView()
      .should('be.visible')
      .type('Custom');

    cy.wait(['@fetchServices', '@fetchDashboard']);
    ui.autocompletePopper.findByTitle('Custom').should('be.visible').click();

    cy.findByPlaceholderText('Select Start Date').should('be.visible').click();
    cy.findByRole('gridcell', { name: startDate.day.toString() })
      .should('be.visible')
      .click();

    cy.get('[data-testid="ClockIcon"]').should('be.visible').click();
    cy.get('[aria-label="Select hours"]')
      .scrollIntoView({ easing: 'linear' })
      .within(() => {
        cy.get(`[aria-label="${startDate.hour} hours"]`).click();
      });

    cy.get('[aria-label="Select minutes"]')
      .scrollIntoView({ easing: 'linear', duration: 500 })
      .within(() => {
        cy.get(`[aria-label="${startDate.minute} minutes"]`).click({
          force: true,
        });
      });

    cy.get('[aria-label="Select meridiem"]')
      .scrollIntoView({ easing: 'linear' })
      .within(() => {
        cy.get('[aria-label="PM"]').click({ force: true });
      });

    cy.findByRole('button', { name: 'Apply' }).should('be.visible').click();
    cy.findByPlaceholderText('Select Start Date')
      .should('be.visible')
      .should('have.value', `${startDate.actualDate} (${timezone})`);

    cy.findByPlaceholderText('Select End Date').should('be.visible').click();
    cy.findByRole('gridcell', { name: endDate.day.toString() })
      .should('be.visible')
      .click();

    cy.get('[data-testid="ClockIcon"]').click();
    cy.get('[aria-label="Select hours"]')
      .scrollIntoView({ easing: 'linear', duration: 500 })
      .within(() => {
        cy.get(`[aria-label="${endDate.hour} hours"]`).click();
      });

    cy.get('[aria-label="Select minutes"]')
      .scrollIntoView({ easing: 'linear', duration: 500 })
      .within(() => {
        cy.get(`[aria-label="${endDate.minute} minutes"]`).click({
          force: true,
        });
      });

    cy.get('[aria-label="Select meridiem"]')
      .scrollIntoView({ easing: 'linear', duration: 500 })
      .within(() => {
        cy.get('[aria-label="AM"]').click({ force: true });
      });

    cy.findByRole('button', { name: 'Apply' }).should('be.visible').click();
    cy.findByPlaceholderText('Select End Date').should(
      'have.value',
      `${endDate.actualDate} (${timezone})`
    );

    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${nodeType}{enter}`);

    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);
    cy.get('@getMetrics.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;
        expect(requestPayload.absolute_time_duration.start).to.equal(
          convertToGmt(startDate.actualDate.replace(' ', 'T'))
        );
        expect(requestPayload.absolute_time_duration.end).to.equal(
          convertToGmt(endDate.actualDate.replace(' ', 'T'))
        );
      });

    cy.findByRole('button', { name: 'Presets' }).should('be.visible').click();
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getPresets'
    );

    ui.autocomplete
      .findByLabel('Time Range')
      .should('be.visible')
      .type('Last 30 Days');

    ui.autocompletePopper
      .findByTitle('Last 30 Days')
      .should('be.visible')
      .click();

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
        .type(`${nodeType}{enter}`);

      cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);
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
      .type(`${nodeType}{enter}`);

    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);

    cy.get('@getMetrics.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;
        expect(requestPayload.absolute_time_duration.start).to.equal(
          getLastMonthRange().start
        );
        expect(requestPayload.absolute_time_duration.end).to.equal(
          getLastMonthRange().end
        );
      });
  });

  it('Select the "This Month" preset from the "Time Range" dropdown and verify its functionality.', () => {
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
      .type(`${nodeType}{enter}`);

    cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);

    cy.get('@getMetrics.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;
        expect(requestPayload.absolute_time_duration.start).to.equal(
          getThisMonthRange().start
        );
        expect(requestPayload.absolute_time_duration.end).to.equal(
          getThisMonthRange().end
        );
      });
  });
});
