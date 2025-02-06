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
import { Database } from '@linode/api-v4';
import { generateRandomMetricsData } from 'support/util/cloudpulse';
import { mockGetDatabases } from 'support/intercepts/databases';
import type { Flags } from 'src/featureFlags';
import { Interception } from 'cypress/types/net-stubbing';
import {
  convertToGmt,
  getLastMonthRange,
  getThisMonthRange,
  getDateRangeInIST,
} from 'src/features/CloudPulse/Utils/CloudPulseDateTimePickerUtils';
import { formatDate } from 'src/utilities/formatDate';

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
const mockProfile = profileFactory.build({
  timezone: 'Asia/Kolkata',
});

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
    mockGetProfile(mockProfile).as('getProfile');
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
    cy.wait(['@getProfile', '@fetchPreferences']);
  });

  it('Implement and validate the functionality of the custom date and time picker for selecting a specific date and time range', () => {
    const {
      actualDate: startActualDate,
      day: startDay,
      hour: startHour,
      minute: startMinute,
    } = getDateRangeInIST(0, 12, 15);
    const {
      actualDate: endActualDate,
      day: endDay,
      hour: endHour,
      minute: endMinute,
    } = getDateRangeInIST(25, 1, 15);

    ui.autocomplete
      .findByLabel('Time Range')
      .scrollIntoView()
      .should('be.visible')
      .type('Custom');

    cy.wait(['@fetchServices', '@fetchDashboard']);
    ui.autocompletePopper.findByTitle('Custom').should('be.visible').click();

    cy.findByPlaceholderText('Select Start Date').should('be.visible').click();
    cy.findByRole('gridcell', { name: startDay.toString() })
      .should('be.visible')
      .click();

    cy.findByTestId('ClockIcon').should('be.visible').click();
    cy.get('[aria-label="Select hours"]')
      .scrollIntoView({ easing: 'linear' })
      .within(() => {
        cy.get(`[aria-label="${startHour} hours"]`).click();
      });

    cy.get('[aria-label="Select minutes"]')
      .scrollIntoView({ easing: 'linear', duration: 500 })
      .within(() => {
        cy.get(`[aria-label="${startMinute} minutes"]`).click();
      });

    cy.get('[aria-label="Select meridiem"]')
      .scrollIntoView({ easing: 'linear' })
      .within(() => {
        cy.get('[aria-label="PM"]').click();
      });

    cy.findByRole('button', { name: 'Apply' }).should('be.visible').click();

    cy.findByPlaceholderText('Select Start Date')
      .should('be.visible')
      .and('have.value', `${startActualDate} PM (GMT+5:30)`);

    cy.findByPlaceholderText('Select End Date').should('be.visible').click();
    cy.findByRole('gridcell', { name: endDay.toString() })
      .should('be.visible')
      .click();

    cy.findByTestId('ClockIcon').click();

    cy.get('[aria-label="Select hours"]')
      .scrollIntoView({ easing: 'linear', duration: 500 })
      .within(() => {
        cy.get(`[aria-label="${endHour} hours"]`).click();
      });

    cy.get('[aria-label="Select minutes"]')
      .scrollIntoView({ easing: 'linear', duration: 500 })
      .within(() => {
        cy.get(`[aria-label="${endMinute} minutes"]`).click();
      });

    cy.get('[aria-label="Select meridiem"]')
      .scrollIntoView({ easing: 'linear', duration: 500 })
      .within(() => {
        cy.get('[aria-label="AM"]').click({ force: true });
      });

    cy.findByRole('button', { name: 'Apply' }).should('be.visible').click();
    cy.findByPlaceholderText('Select End Date').should(
      'have.value',
      `${endActualDate} AM (GMT+5:30)`
    );

    ui.autocomplete
      .findByLabel('Node Type')
      .should('be.visible')
      .type(`${nodeType}{enter}`);

    cy.wait(Array(4).fill('@getMetrics'));

    cy.get('@getMetrics.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;
        expect(requestPayload.absolute_time_duration.start).to.equal(
          convertToGmt(startActualDate.replace(' ', 'T'))
        );
        expect(requestPayload.absolute_time_duration.end).to.equal(
          convertToGmt(endActualDate.replace(' ', 'T'))
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

    cy.wait(Array(4).fill('@getMetrics'));

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
    const start = getThisMonthRange().start;
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

    cy.wait(Array(4).fill('@getMetrics'));

    const end = getThisMonthRange().end;

    cy.get('@getMetrics.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;

        expect(requestPayload.absolute_time_duration.start).to.equal(start);

        cy.log('end date', formatDate(end, { format: 'yyyy-MM-dd hh:mm a' }));
        cy.log(
          'requestPayload date',
          formatDate(requestPayload.absolute_time_duration.end, {
            format: 'yyyy-MM-dd hh:mm a',
          })
        );
        expect(
          formatDate(requestPayload.absolute_time_duration.end, {
            format: 'yyyy-MM-dd hh:mm',
          })
        ).to.equal(formatDate(end, { format: 'yyyy-MM-dd hh:mm' }));
      });
  });
});
