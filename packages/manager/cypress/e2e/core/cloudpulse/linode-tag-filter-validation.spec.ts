/**
 * @file Integration Tests for CloudPulse Linode Dashboard with Dynamic Mocking.
 */

import { linodeFactory, regionFactory } from '@linode/utilities';
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
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { generateRandomMetricsData } from 'support/util/cloudpulse';

import {
  accountFactory,
  cloudPulseMetricsResponseFactory,
  dashboardFactory,
  dashboardMetricFactory,
  widgetFactory,
} from 'src/factories';

import type { Flags } from 'src/featureFlags';
import type { Interception } from 'support/cypress-exports';

const timeDurationToSelect = 'Last 24 Hours';
const flags: Partial<Flags> = {
  aclp: { beta: true, enabled: true },
  aclpResourceTypeMap: [
    {
      dimensionKey: 'LINODE_ID',
      maxResourceSelections: 10,
      serviceType: 'linode',
      supportedRegionIds: 'us-ord',
    },
    {
      dimensionKey: 'cluster_id',
      maxResourceSelections: 10,
      serviceType: 'dbaas',
      supportedRegionIds: '',
    },
  ],
};

const { dashboardName, id, metrics, serviceType } = widgetDetails.linode;

const dashboard = dashboardFactory.build({
  label: dashboardName,
  service_type: serviceType,
  widgets: metrics.map(({ name, title, unit, yLabel }) =>
    widgetFactory.build({
      label: title,
      metric: name,
      unit,
      y_label: yLabel,
    })
  ),
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

const linodes = [
  linodeFactory.build({
    id: 1,
    label: 'linodeWithTagsTag2AndTag3',
    region: 'us-ord',
    tags: ['tag-2', 'tag-3'],
  }),
  linodeFactory.build({
    id: 2,
    label: 'linodeWithTagsTag3AndTag4',
    region: 'us-ord',
    tags: ['tag-3', 'tag-4'],
  }),
  linodeFactory.build({
    id: 3,
    label: 'linodeNoTags',
    region: 'us-ord',
  }),
];

const mockAccount = accountFactory.build();

const mockRegion = regionFactory.build({
  capabilities: ['Linodes'],
  id: 'us-ord',
  label: 'Chicago, IL',
});

const metricsAPIResponsePayload = cloudPulseMetricsResponseFactory.build({
  data: generateRandomMetricsData(timeDurationToSelect, '5 min'),
});

describe('Integration Tests for Linode Dashboard with Dynamic Mocking', () => {
  beforeEach(() => {
    mockAppendFeatureFlags(flags);
    mockGetAccount(mockAccount);
    mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions.data);
    mockGetCloudPulseDashboards(serviceType, [dashboard]).as('fetchDashboard');
    mockGetCloudPulseServices([serviceType]).as('fetchServices');
    mockGetLinodes(linodes).as('fetchResources');
    mockGetCloudPulseDashboard(id, dashboard);
    mockCreateCloudPulseJWEToken(serviceType);
    mockCreateCloudPulseMetrics(serviceType, metricsAPIResponsePayload).as(
      'getMetrics'
    );
    mockGetRegions([mockRegion]);
    mockGetUserPreferences({
      aclpPreference: {
        dashboardId: 1,
        region: 'us-ord',
        widgets: {},
      },
    }).as('fetchpreferences');
  });

  it('Select a resource without applying any tags', () => {
    cy.visitWithLogin('metrics');
    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchResources']);
    mockGetLinodes([linodes[0]]);
    ui.autocomplete
      .findByLabel('Resources')
      .type(`${linodes[0].label}{enter}`)
      .click();

    // Expand the applied filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
          .should('be.visible')
          .should('have.text', 'US, Chicago, IL');

        cy.get(`[data-qa-value="Resources ${linodes[0].label}"]`)
          .should('be.visible')
          .should('have.text', linodes[0].label);
      });
  });

  it('Verify the users tag preferences are correctly applied and reflected in the system', () => {
    mockGetUserPreferences({
      aclpPreference: {
        dashboardId: 1,
        region: 'us-ord',
        resources: ['1', '2'],
        tags: ['tag-4', 'tag-2'],
        widgets: {},
      },
    }).as('fetchPutPreferences');

    cy.visitWithLogin('metrics');

    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchPutPreferences']);

    // Expand the applied filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-qa-value="Region US, Chicago, IL"]')
          .should('be.visible')
          .should('have.text', 'US, Chicago, IL');

        cy.get(`[data-qa-value="Resources ${linodes[0].label}"]`)
          .should('be.visible')
          .should('have.text', linodes[0].label);

        cy.get(`[data-qa-value="Resources ${linodes[1].label}"]`)
          .should('be.visible')
          .should('have.text', linodes[1].label);

        cy.get('[data-qa-value="Tags tag-4"]')
          .should('be.visible')
          .should('have.text', 'tag-4');

        cy.get('[data-qa-value="Tags tag-2"]')
          .should('be.visible')
          .should('have.text', 'tag-2');
      });
  });

  it('should correctly filter resources by tags, region, select tag "tag-2" and available resource should be linodeWithTagsTag2AndTag3', () => {
    cy.visitWithLogin('metrics');

    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchResources']);

    ui.autocomplete.findByLabel('Resources').click();
    cy.get('[data-qa-autocomplete-popper="true"] ul')
      .children('li[data-qa-option="true"]')
      .should('have.length', 4)
      .and(
        'have.text',
        'Select All linodeWithTagsTag2AndTag3linodeWithTagsTag3AndTag4linodeNoTags'
      );

    ui.autocomplete.findByLabel('Tags').type('tag-2');
    ui.autocompletePopper.findByTitle('tag-2').click();

    mockGetLinodes([linodes[0]]);

    ui.autocomplete
      .findByLabel('Resources')
      .type(`${linodes[0].label}{enter}`)
      .click();

    ui.autocomplete.findByLabel('Resources').click();

    cy.get('[data-qa-autocomplete-popper="true"] ul')
      .children('li[data-qa-option="true"]')
      .should('have.length', 2)
      .and('have.text', 'Deselect All linodeWithTagsTag2AndTag3');

    // Verify that the network call's request payload matches the expected structure and values
    cy.get('@getMetrics.all')
      .should('have.length', 4)
      .each((xhr: unknown) => {
        const interception = xhr as Interception;
        const { body: requestPayload } = interception.request;
        const { metrics: metric, relative_time_duration: timeRange } =
          requestPayload;
        const metricData = metrics.find(({ name }) => name === metric[0].name);

        if (!metricData) {
          throw new Error(
            `Unexpected metric name '${metric[0].name}' included in the outgoing refresh API request`
          );
        }

        expect(metric[0].name).to.equal(metricData.name);
        expect(timeRange).to.have.property('unit', 'min');
        expect(timeRange).to.have.property('value', 30);
        expect(interception.request.body.entity_ids).to.deep.equal([1]);
        expect(
          interception.request.body.metrics[0].aggregate_function
        ).to.equal('avg');
      });
  });

  it('should correctly filter resources by tags, region, select tag "tag-3" and available resources should be linodeWithTagsTag2AndTag3, linodeWithTagsTag3AndTag4', () => {
    cy.visitWithLogin('metrics');

    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchResources']);

    ui.autocomplete.findByLabel('Resources').click();
    cy.get('[data-qa-autocomplete-popper="true"] ul')
      .children('li[data-qa-option="true"]')
      .should('have.length', 4)
      .and(
        'have.text',
        'Select All linodeWithTagsTag2AndTag3linodeWithTagsTag3AndTag4linodeNoTags'
      );

    ui.autocomplete.findByLabel('Tags').type('tag-3');
    ui.autocompletePopper.findByTitle('tag-3').click();

    mockGetLinodes([linodes[0], linodes[1]]);
    ui.autocomplete.findByLabel('Resources').click();

    cy.get('[data-qa-autocomplete-popper="true"] ul')
      .children('li[data-qa-option="true"]')
      .should('have.length', 3)
      .and(
        'have.text',
        'Select All linodeWithTagsTag2AndTag3linodeWithTagsTag3AndTag4'
      );
  });

  it('add extra tag and verify resource', () => {
    cy.visitWithLogin('metrics');

    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchResources']);

    ui.autocomplete.findByLabel('Tags').type('tag-2');
    ui.autocompletePopper.findByTitle('tag-2').click();

    mockGetLinodes([linodes[0]]);
    ui.autocomplete
      .findByLabel('Resources')
      .type(`${linodes[0].label}{enter}`)
      .click();

    ui.autocomplete.findByLabel('Tags').scrollIntoView().type('tag-4');
    ui.autocompletePopper.findByTitle('tag-4').click();

    ui.autocomplete.findByLabel('Tags').click(); // closing autocomplete

    cy.findByPlaceholderText('Select Resources').should('have.value', '');

    // Expand the applied filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
          .should('be.visible')
          .should('have.text', 'US, Chicago, IL');

        cy.get('[data-qa-value="Tags tag-2"]')
          .should('be.visible')
          .should('have.text', 'tag-2');

        cy.get('[data-qa-value="Tags tag-4"]')
          .should('be.visible')
          .should('have.text', 'tag-4');
      });
  });

  it('delete tag-2 and add tag-4 tag and verify resource', () => {
    cy.visitWithLogin('metrics');

    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchResources']);

    ui.autocomplete.findByLabel('Tags').type('tag-2');

    ui.autocompletePopper.findByTitle('tag-2').click();

    mockGetLinodes([linodes[0]]);

    ui.autocomplete
      .findByLabel('Resources')
      .type(`${linodes[0].label}{enter}`)
      .click();

    cy.get('button[aria-label="Clear"]').eq(2).click();

    ui.autocomplete.findByLabel('Tags').type('tag-4');

    ui.autocompletePopper.findByTitle('tag-4').click();

    ui.autocomplete.findByLabel('Tags').click(); // closing autocomplete

    cy.findByPlaceholderText('Select Resources').should('have.value', '');

    // Expand the applied filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
          .should('be.visible')
          .should('have.text', 'US, Chicago, IL');

        cy.get('[data-qa-value="Tags tag-4"]')
          .should('be.visible')
          .should('have.text', 'tag-4');
      });
  });

  it('selecting multiple resources, applying multiple tags, and verify that the resource selections are updated correctly based on the applied filters.', () => {
    cy.visitWithLogin('metrics');

    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchResources']);

    mockGetLinodes([linodes[0], linodes[1]]);

    ui.autocomplete
      .findByLabel('Resources')
      .type(`${linodes[0].label}{enter}`)
      .click();

    ui.autocomplete
      .findByLabel('Resources')
      .type(`${linodes[1].label}{enter}`)
      .click();

    ui.autocomplete.findByLabel('Tags').type('tag-2');

    ui.autocompletePopper.findByTitle('tag-2').click();

    ui.autocomplete.findByLabel('Tags').type('tag-4');

    ui.autocompletePopper.findByTitle('tag-4').click();

    ui.autocomplete.findByLabel('Tags').click(); // closing autocomplete

    cy.findByPlaceholderText('Select Resources').should('have.value', '');

    // Expand the applied filters section
    ui.button.findByTitle('Filters').should('be.visible').click();

    // Verify that the applied filters
    cy.get('[data-qa-applied-filter-id="applied-filter"]')
      .should('be.visible')
      .within(() => {
        cy.get(`[data-qa-value="Region US, Chicago, IL"]`)
          .should('be.visible')
          .should('have.text', 'US, Chicago, IL');

        cy.get('[data-qa-value="Tags tag-4"]')
          .should('be.visible')
          .should('have.text', 'tag-4');
      });
  });
});
