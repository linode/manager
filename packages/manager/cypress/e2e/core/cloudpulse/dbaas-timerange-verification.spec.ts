/**
* @file Integration Tests for CloudPulse Dbass Dashboard.
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
import { Database } from '@linode/api-v4';
import { generateRandomMetricsData } from 'support/util/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import type { Flags } from 'src/featureFlags';
import { Interception } from 'cypress/types/net-stubbing';
import { DateTime } from 'luxon';
import { convertToGmt } from 'src/features/CloudPulse/Utils/CloudPulseDateTimePickerUtils';
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

const { metrics, id, serviceType, dashboardName, engine, nodeType } =
  widgetDetails.dbaas;

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
const timezone = 'Asia/Kolkata'

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
*   - `actualDate`: The formatted date and time in IST (YYYY-MM-DD HH:MM).
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
  // Get the current date and time in the specified timezone
  const now = DateTime.now().setZone(timezone);
  
  // Set the date to the 1st of the current month
  const targetDate = now.startOf('month').plus({ days: daysOffset }).set({ hour, minute });

  // Format the date and return the details
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

describe('Integration Tests for DBaaS Dashboard ', () => {
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
    // Wait for the services and dashboard API calls to complete before proceeding
  });

  it('should allow users to select their desired granularity and see the most recent data from the API reflected in the graph', () => {
    const startDate = getDateRangeInIST(0, 12, 15); // set start date to  
    const endDate = getDateRangeInIST(25, 12, 15); // set end date to today

    cy.log('DAY*************',startDate.day)
    cy.log('HOUR',startDate.hour)
    cy.log('minute',startDate.minute)

    cy.log(' endDate DAY',endDate.day)
    cy.log('HOUR',endDate.hour)
    cy.log('minute',endDate.minute)


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

      cy.get('[data-testid="ClockIcon"]').click();

      cy.get('[aria-label="Select hours"]').within(() => {
        cy.get(`[aria-label="${startDate.hour} hours"]`).click();
      });
  
      // Select the minute (example: 00)
      cy.get('[aria-label="Select minutes"]').within(() => {
        cy.get(`[aria-label="${startDate.minute} minutes"]`).click();
      });
  
      // Select AM/PM (example: AM)
      cy.get('[aria-label="Select meridiem"]').within(() => {
        cy.get('[aria-label="PM"]').click();
      });
  
     
      cy.findByRole('button', { name: 'Apply' }).should('be.visible').click();

 

    cy.findByPlaceholderText('Select Start Date')
      .should('have.value', startDate.actualDate + ' (' + timezone + ')'
    );

    cy.findByPlaceholderText('Select End Date').should('be.visible').click();

    cy.findByRole('gridcell', { name: endDate.day.toString() })
      .should('be.visible')
      .click();

      cy.get('[data-testid="ClockIcon"]').click();

      cy.get('[aria-label="Select hours"]').within(() => {
        cy.get(`[aria-label="${endDate.hour} hours"]`).click();
      });
  
      // Select the minute (example: 00)
      cy.get('[aria-label="Select minutes"]').within(() => {
        cy.get(`[aria-label="${endDate.minute} minutes"]`).click();
      });
  
      // Select AM/PM (example: AM)
      cy.get('[aria-label="Select meridiem"]').within(() => {
        cy.get('[aria-label="PM"]').click();
      });
  

    cy.findByRole('button', { name: 'Apply' }).should('be.visible').click();

    cy.findByPlaceholderText('Select End Date').should(
      'have.value',
      endDate.actualDate + ' (' + timezone + ')'
    );

    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${nodeType}{enter}`);

    // Wait for all metrics query requests to resolve.
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

    // Select a time duration from the autocomplete input.
    ui.autocomplete
      .findByLabel('Time Range')
      .should('be.visible')
      .type('Last 30 Days');

    ui.autocompletePopper
      .findByTitle('Last 30 Days')
      .should('be.visible')
      .click();
    // Wait for all metrics query requests to resolve.
    cy.get('@getPresets.all')
      .should('have.length', 4) // Ensure all 4 requests are intercepted (first and second batch)
      .each((xhr: unknown, index: number) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;

        // Assert relative_time_duration for the next two requests
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
});