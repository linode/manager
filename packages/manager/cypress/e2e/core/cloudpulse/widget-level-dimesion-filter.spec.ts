import { regionFactory } from '@linode/utilities';
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
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetVolumes } from 'support/intercepts/volumes';
import { ui } from 'support/ui';
import { generateRandomMetricsData } from 'support/util/cloudpulse';

import {
  accountFactory,
  cloudPulseMetricsResponseFactory,
  dashboardFactory,
  dashboardMetricFactory,
  flagsFactory,
  volumeFactory,
  widgetFactory,
} from 'src/factories';

import type { Dashboard, Filters } from '@linode/api-v4';
import type { Interception } from 'support/cypress-exports';

// Constants for repeated strings
const VISIBLE = 'be.visible';
const ENABLED = 'be.enabled';
const DISABLED = 'be.disabled';
const NOT_DISABLED = 'not.be.disabled';
const ARIA_LABEL = 'aria-label';
const ARIA_DISABLED = 'aria-disabled';
const NOT_HAVE_ATTR = 'not.have.attr';
const DIMENSION_FILTERS_TEXT = 'Dimension Filters';
const ADD_FILTER_TEXT = 'Add Filter';
const APPLY_LABEL = 'Apply';
const CANCEL_LABEL = 'Cancel';
const SELECT_DIMENSION_PLACEHOLDER = 'Select a Dimension';
const SELECT_OPERATOR_PLACEHOLDER = 'Select an Operator';
const ENTER_VALUE_PLACEHOLDER = 'Enter a Value';
const DIMENSION_FILTER_BADGE =
  '[data-qa-badge="dimension-filter-badge-content"]';
const DIMENSION_FILTER_PREFIX = '[data-qa-dimension-filter="dimension_filters.';
const DIMENSION_FIELD_SUFFIX = '-dimension-field"]';
const GET_METRICS_ALIAS = '@getMetrics';
const METRICS_REQUESTS_COUNT = 6;
const FILTER_BTN_ALIAS = 'filterBtn';
const CONTAIN_TEXT = 'contain.text';
const SELECT_UP_TO_5_TEXT = 'Select up to 5 filters.';

// Helper functions
const openFilterDrawer = (widgetIndex: number = 0) => {
  ui.button
    .findByAttribute(
      ARIA_LABEL,
      `Widget Dimension Filter${dashboard.widgets[widgetIndex].label}`
    )
    .should(VISIBLE)
    .and(NOT_DISABLED)
    .as(FILTER_BTN_ALIAS);

  cy.get(`@${FILTER_BTN_ALIAS}`).should(ENABLED).click();
  ui.drawer.find().should('exist');
};

const addFilter = (
  index: number,
  dimension: string,
  operator: string,
  value: string
) => {
  ui.button.findByTitle(ADD_FILTER_TEXT).click();

  cy.get(
    `[data-qa-dimension-filter="dimension_filters.${index}-dimension-field"]`
  )
    .findByPlaceholderText(SELECT_DIMENSION_PLACEHOLDER)
    .should(VISIBLE)
    .type(dimension);

  cy.findByText(dimension).should(VISIBLE).click();

  cy.get(`[data-qa-dimension-filter="dimension_filters.${index}-operator"]`)
    .findByPlaceholderText(SELECT_OPERATOR_PLACEHOLDER)
    .should(VISIBLE)
    .type(operator);

  cy.findByText(operator).should(VISIBLE).click();

  cy.get(`[data-qa-dimension-filter="dimension_filters.${index}-value"]`)
    .findByPlaceholderText(ENTER_VALUE_PLACEHOLDER)
    .should(VISIBLE)
    .type(value);
};

const verifyDrawerContent = (widgetIndex: number = 0) => {
  ui.drawer.find().within(() => {
    cy.get('[data-testid="drawer-title"]')
      .should(VISIBLE)
      .and(CONTAIN_TEXT, DIMENSION_FILTERS_TEXT);

    cy.get('[data-qa-id="filter-drawer-subtitle"]')
      .should(VISIBLE)
      .and(CONTAIN_TEXT, dashboard.widgets[widgetIndex].label);

    cy.get('[data-qa-id="filter-drawer-selection-title"]')
      .should(VISIBLE)
      .and(CONTAIN_TEXT, SELECT_UP_TO_5_TEXT);
  });
};

const verifyBadgeCount = (count: string) => {
  cy.get(`@${FILTER_BTN_ALIAS}`).within(() => {
    cy.get(DIMENSION_FILTER_BADGE).should(VISIBLE).and(CONTAIN_TEXT, count);
  });
};

const timeDurationToSelect = 'Last 24 Hours';
const { dashboardName, id, metrics } = widgetDetails.blockstorage;
const serviceType = 'blockstorage';

// Dashboard definition
const dashboard = dashboardFactory.build({
  label: dashboardName,
  service_type: serviceType,
  id,
  widgets: metrics.map(({ name, title, unit, yLabel }) =>
    widgetFactory.build({
      filters: [],
      label: title,
      metric: name,
      unit,
      y_label: yLabel,
      namespace_id: id,
      service_type: serviceType,
    })
  ),
});

// Convert widget filters to dashboard filters
const getFiltersForMetric = (metricName: string) => {
  const metric = metrics.find((m) => m.name === metricName);
  if (!metric) return [];

  return metric.filters.map((filter) => ({
    dimension_label: filter.dimension_label,
    label: filter.dimension_label,
    values: filter.value ? [filter.value].flat() : undefined,
  }));
};

// Metric definitions
const metricDefinitions = metrics.map(({ name, title, unit }) =>
  dashboardMetricFactory.build({
    label: title,
    metric: name,
    unit,
    dimensions: [...getFiltersForMetric(name)],
  })
);

const mockRegions = [
  regionFactory.build({
    capabilities: ['Block Storage'],
    id: 'us-ord',
    label: 'Chicago, IL',
    monitors: {
      metrics: ['Block Storage'],
      alerts: [],
    },
  }),
];

const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

const mockVolumesEncrypted = [
  volumeFactory.build({
    encryption: 'enabled',
    label: 'test-volume-ord',
    region: 'us-ord', // Chicago
  }),
];

const loadDashboard = () => {
  // Block LaunchDarkly clientstream to prevent feature flags from being overridden
  mockGetFeatureFlagClientstream();
  const flags = flagsFactory.build();
  const mergedFlags = {
    ...flags,
    aclp: {
      ...flags.aclp,
      showWidgetDimensionFilters: true,
    },
  };
  mockAppendFeatureFlags(mergedFlags).as('featureFlags');
  mockGetAccount(accountFactory.build());
  mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
  mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
  mockGetCloudPulseServices([serviceType]).as('fetchServices');
  mockGetCloudPulseDashboard(id, dashboard).as('fetchDashboard');
  mockCreateCloudPulseJWEToken(serviceType);
  mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
    'getMetrics'
  );
  mockGetRegions(mockRegions);
  mockGetVolumes(mockVolumesEncrypted);
  mockGetUserPreferences({});

  // Navigate to the metrics page
  cy.visitWithLogin('/metrics');

  // Wait for the services and dashboard API calls to complete before proceeding
  cy.wait(['@fetchServices']);
  cy.wait('@fetchDashboard').then((interception: Interception) => {
    const dashboards = interception.response?.body?.data as Dashboard[];
    const dashboard = dashboards[0];
    expect(dashboard.widgets).to.have.length(6);
  });

  // Selecting a dashboard from the autocomplete input.
  ui.autocomplete.findByLabel('Dashboard').should(VISIBLE).type(dashboardName);

  ui.autocompletePopper.findByTitle(dashboardName).should(VISIBLE).click();

  // Select a time duration from the autocomplete input.
  cy.get('[aria-labelledby="start-date"]').parent().as('startDateInput');
  cy.get('@startDateInput').click();
  cy.get('[data-qa-preset="Last day"]').click();
  ui.buttonGroup.find().should(VISIBLE).should(ENABLED).click();

  // Select a region from the dropdown.
  ui.regionSelect.find().clear();
  ui.regionSelect.find().click();
  ui.regionSelect.find().click().type(`${mockRegions[0].label}{enter}`);

  ui.autocomplete
    .findByLabel('Volumes')
    .should(VISIBLE)
    .type(mockVolumesEncrypted[0].label);

  ui.autocompletePopper
    .findByTitle(mockVolumesEncrypted[0].label)
    .should(VISIBLE)
    .click();

  mockVolumesEncrypted.slice(2).forEach((vol) => {
    ui.autocompletePopper.find().contains(vol.label).should('not.exist'); // Ensure no duplicates
  });

  ui.autocomplete.findByLabel('Volumes').type('{esc}');

  // Wait for all metrics query requests to resolve.
  const metricsRequests = Array(METRICS_REQUESTS_COUNT).fill(GET_METRICS_ALIAS);
  cy.wait(metricsRequests);

  // Wait for widgets to fully load
  cy.get('[data-qa-widget]').should('have.length.at.least', 1);
};

describe('Cloud pulse widget level dimension filter ', () => {
  beforeEach(() => {
    // Load dashboard with all mocks and setup for each test
    loadDashboard();
    /*
     * - Verifies Initial state of filter is correct.
     * - Validates clicking the filter icon opens the filter drawer.
     * - Confirms the clearall,close icon, apply and cancel buttons function correctly.
     * - Verifies the mock response contains the applied filter.
     * - Ensures a maximum of 5 filters can be added and the add filter button is disabled on adding the 5th filter.
     */
  });

  it('should verify initial UI state of the filter drawer  - test apply, add and delete)', () => {
    ui.tooltip.findByText(DIMENSION_FILTERS_TEXT).should(VISIBLE);
    ui.drawer.find().should('not.exist');

    openFilterDrawer();
    verifyDrawerContent();

    ui.button.findByTitle(ADD_FILTER_TEXT).should(VISIBLE).and(ENABLED);
    ui.button
      .findByAttribute('label', CANCEL_LABEL)
      .should(VISIBLE)
      .and(ENABLED);
    ui.button
      .findByAttribute('label', APPLY_LABEL)
      .should(VISIBLE)
      .and(NOT_HAVE_ATTR, ARIA_DISABLED, 'true');
    ui.drawerCloseButton.find().should(VISIBLE).and(ENABLED);

    cy.get('[data-qa-dimension-filter="dimension_filters.0-id"]').should(
      'not.exist'
    );

    addFilter(0, 'entity_id', 'Equal', '123');

    ui.button
      .findByAttribute('label', APPLY_LABEL)
      .should(VISIBLE)
      .and(NOT_HAVE_ATTR, ARIA_DISABLED, 'true');

    ui.button.findByAttribute('label', APPLY_LABEL).click();

    ui.drawer.find().should('not.exist');

    verifyBadgeCount('1');

    // Validate the widget-level metrics API call contains correct filters
    cy.wait(GET_METRICS_ALIAS).then((interception) => {
      expect(interception)
        .to.have.property('response')
        .with.property('statusCode', 200);

      // Check for entity_id filter with value "123"
      const entityIdFilter = interception.request.body.filters.find(
        (filter: Filters) => filter.dimension_label === 'entity_id'
      );

      expect(entityIdFilter).to.exist;
      expect(entityIdFilter.operator).to.equal('eq');
      expect(entityIdFilter.value).to.equal('123');

      // Ensure only one filter is applied
      expect(interception.request.body.filters).to.have.length(1);
    });
  });

  it('should verify at max 5 filters can be added at widget level and add filter to be disabled on adding 5th filter', () => {
    openFilterDrawer();

    const filters = [
      { dimension: 'entity_id', operator: 'Equal', value: '123' },
      { dimension: 'entity_id', operator: 'Equal', value: '345' },
      { dimension: 'response_type', operator: 'Equal', value: '2xx' },
      { dimension: 'response_type', operator: 'Equal', value: '4xx' },
      { dimension: 'entity_id', operator: 'Equal', value: '123' },
    ];

    filters.forEach((filter, index) =>
      addFilter(index, filter.dimension, filter.operator, filter.value)
    );

    // After 5th filter, Add Filter button should be disabled
    ui.button.findByTitle(ADD_FILTER_TEXT).should(VISIBLE).and(DISABLED);

    ui.button
      .findByAttribute('label', APPLY_LABEL)
      .should(VISIBLE)
      .and(NOT_HAVE_ATTR, ARIA_DISABLED, 'true');

    ui.button.findByAttribute('label', APPLY_LABEL).click();

    ui.drawer.find().should('not.exist');

    verifyBadgeCount('5');

    // intercept api call to validate 5 filters applied
    cy.wait(GET_METRICS_ALIAS).then((interception) => {
      expect(interception)
        .to.have.property('response')
        .with.property('statusCode', 200);

      // Ensure 5 filters are applied
      expect(interception.request.body.filters).to.have.length(5);
    });
  });

  it('should verify deleting a filter from the filter drawer', () => {
    openFilterDrawer();

    const filters = [
      { dimension: 'entity_id', operator: 'Equal', value: '123' },
      { dimension: 'entity_id', operator: 'Equal', value: '345' },
      { dimension: 'response_type', operator: 'Equal', value: '2xx' },
      { dimension: 'response_type', operator: 'Equal', value: '4xx' },
      { dimension: 'entity_id', operator: 'Equal', value: '123' },
    ];

    filters.forEach((filter, index) =>
      addFilter(index, filter.dimension, filter.operator, filter.value)
    );

    // Delete the filter
    ui.button
      .findByAttribute('data-testid', 'clear-icon')
      .should(VISIBLE)
      .and(ENABLED)
      .first()
      .as('deleteFirstFilterBtn');

    cy.get('@deleteFirstFilterBtn').click();

    // Delete the filter
    ui.button
      .findByAttribute('data-testid', 'clear-icon')
      .should(VISIBLE)
      .and(ENABLED)
      .last()
      .as('deleteLastFilterBtn');

    cy.get('@deleteLastFilterBtn').click();

    // Verify filter is deleted
    cy.get('[data-qa-dimension-filter="dimension_filters.0-id"]').should(
      'not.exist'
    );

    ui.button.findByAttribute('label', APPLY_LABEL).click();

    // intercept api call to validate 3 filters applied
    cy.wait(GET_METRICS_ALIAS).then((interception) => {
      expect(interception)
        .to.have.property('response')
        .with.property('statusCode', 200);

      // Ensure 3 filters are applied
      expect(interception.request.body.filters).to.have.length(3);
    });
  });

  it('should verify closing filter drawer and Cancel the filter drawer without applying changes', () => {
    openFilterDrawer();

    addFilter(0, 'entity_id', 'Equal', '123');

    // Close the drawer without applying
    ui.drawerCloseButton.find().should(VISIBLE).and(ENABLED).click();

    ui.drawer.find().should('not.exist');

    cy.get(`@${FILTER_BTN_ALIAS}`).within(() => {
      cy.get(DIMENSION_FILTER_BADGE)
        .should('exist')
        .invoke('text')
        .should('be.empty');
    });

    // Reopen the drawer to verify no filters are present
    cy.get(`@${FILTER_BTN_ALIAS}`).should(ENABLED).click();
    ui.drawer.find().should('exist');

    // Verify no filters are present
    cy.get(`${DIMENSION_FILTER_PREFIX}0${DIMENSION_FIELD_SUFFIX}`).should(
      'not.exist'
    );

    // Click on Cancel button to close the drawer
    ui.button.findByAttribute('label', CANCEL_LABEL).click();
  });

  it('should verify the clear all button in the filter drawer', () => {
    openFilterDrawer();

    // Add 2 filters
    const filters = [
      { dimension: 'entity_id', operator: 'Equal', value: '123' },
      { dimension: 'response_type', operator: 'Equal', value: '2xx' },
    ];

    filters.forEach((filter, index) =>
      addFilter(index, filter.dimension, filter.operator, filter.value)
    );

    // Click Clear All button
    cy.get('[data-qa-id="filter-drawer-clear-all"]').should(VISIBLE).click();

    // Confirm all filters are cleared
    cy.get(`${DIMENSION_FILTER_PREFIX}0${DIMENSION_FIELD_SUFFIX}`).should(
      'not.exist'
    );

    ui.button.findByAttribute('label', APPLY_LABEL).click();

    ui.drawer.find().should('not.exist');

    cy.get(`@${FILTER_BTN_ALIAS}`).within(() => {
      cy.get(DIMENSION_FILTER_BADGE)
        .should('exist')
        .invoke('text')
        .should('be.empty');
    });
  });

  // Verify for all 6 widgets
  it('should verify that filter drawer opens correctly for all widgets and able to add filters', () => {
    dashboard.widgets.forEach((widget, index) => {
      openFilterDrawer(index);
      verifyDrawerContent(index);

      ui.button
        .findByAttribute('label', CANCEL_LABEL)
        .should(VISIBLE)
        .and(ENABLED);

      ui.button
        .findByAttribute('label', APPLY_LABEL)
        .should(VISIBLE)
        .and(NOT_HAVE_ATTR, ARIA_DISABLED, 'true');

      ui.drawerCloseButton.find().should(VISIBLE).and(ENABLED);

      cy.get(
        `${DIMENSION_FILTER_PREFIX}${index}${DIMENSION_FIELD_SUFFIX}`
      ).should('not.exist');

      addFilter(0, 'entity_id', 'Equal', '123');

      ui.button
        .findByAttribute('label', APPLY_LABEL)
        .should(VISIBLE)
        .and(NOT_HAVE_ATTR, ARIA_DISABLED, 'true');

      ui.button.findByAttribute('label', APPLY_LABEL).click();

      ui.drawer.find().should('not.exist');

      verifyBadgeCount('1');
    });
  });

  // Have a global filter for dashboard and now for each widget verify the widget level filters are the ones not in the global filters
  it('should verify that widget level filters exclude global dashboard filters for all widgets', () => {
    // Global filters are already set: Region and Volumes
    const globalFilters = ['region', 'volume_id'];

    dashboard.widgets.forEach((widget, index) => {
      openFilterDrawer(index);

      ui.button.findByTitle(ADD_FILTER_TEXT).click();

      // Click on the dimension input to open the dropdown
      cy.get(`${DIMENSION_FILTER_PREFIX}0${DIMENSION_FIELD_SUFFIX}`)
        .findByPlaceholderText(SELECT_DIMENSION_PLACEHOLDER)
        .should(VISIBLE)
        .click();

      // Verify that global filters (region, volume_id, entity_id) do NOT appear in the dimension options
      cy.get('[role="listbox"] li').each(($li) => {
        const text = $li.text().trim();
        expect(globalFilters).to.not.include(text);
      });

      // Close the drawer
      ui.drawerCloseButton.find().should(VISIBLE).click();
    });
  });
});
