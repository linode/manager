/**
 * @file Integration Tests for CloudPulse Linode Dashboard with Dynamic Mocking.
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
  linodeFactory,
  regionFactory,
  widgetFactory,
} from 'src/factories';
import { mockGetAccount } from 'support/intercepts/account';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { generateRandomMetricsData } from 'support/util/cloudpulse';
import { Flags } from 'src/featureFlags';
import { Interception } from 'cypress/types/net-stubbing';

const timeDurationToSelect = 'Last 24 Hours';
const flags: Partial<Flags> = {
  aclp: { enabled: true, beta: true },
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

const { metrics, id, serviceType, dashboardName } = widgetDetails.linode;

const dashboard = dashboardFactory.build({
  label: dashboardName,
  service_type: serviceType,
  widgets: metrics.map(({ title, yLabel, name, unit }) =>
    widgetFactory.build({
      label: title,
      y_label: yLabel,
      metric: name,
      unit,
    })
  ),
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

const linodes = [
  linodeFactory.build({
    tags: ['tag-2', 'tag-3'],
    label: 'linodeWithTagsTag2AndTag3',
    id: 1,
    region: 'us-ord',
  }),
  linodeFactory.build({
    tags: ['tag-3', 'tag-4'],
    label: 'linodeWithTagsTag3AndTag4',
    id: 2,
    region: 'us-ord',
  }),
  linodeFactory.build({
    label: 'linodeNoTags',
    id: 3,
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
      theme: 'dark',
      aclpPreference: {
        dashboardId: 1,
        widgets: {},
        region: 'us-ord',
      },
    }).as('fetchpreferences');
  });

  it('Select a resource without applying any tags', () => {
    cy.visitWithLogin('monitor');
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
      theme: 'dark',
      aclpPreference: {
        dashboardId: 1,
        widgets: {},
        tags: ['tag-4', 'tag-2'],
        region: 'us-ord',
        resources: ['1', '2'],
      },
    }).as('fetchPutPreferences');

    cy.visitWithLogin('monitor');

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
    cy.visitWithLogin('monitor');

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
        const { metric, relative_time_duration: timeRange } = requestPayload;
        const metricData = metrics.find(({ name }) => name === metric);

        if (!metricData) {
          throw new Error(
            `Unexpected metric name '${metric}' included in the outgoing refresh API request`
          );
        }

        expect(metric).to.equal(metricData.name);
        expect(timeRange).to.have.property('unit', 'min');
        expect(timeRange).to.have.property('value', 30);
        expect(interception.request.body.entity_ids).to.deep.equal([1]);
        expect('avg').to.equal(interception.request.body.aggregate_function);
      });
  });

  it('should correctly filter resources by tags, region, select tag "tag-3" and available resources should be linodeWithTagsTag2AndTag3, linodeWithTagsTag3AndTag4', () => {
    cy.visitWithLogin('monitor');

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
    cy.visitWithLogin('monitor');

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
    cy.visitWithLogin('monitor');

    cy.wait(['@fetchServices', '@fetchDashboard', '@fetchResources']);

    ui.autocomplete.findByLabel('Tags').type('tag-2');

    ui.autocompletePopper.findByTitle('tag-2').click();

    mockGetLinodes([linodes[0]]);

    ui.autocomplete
      .findByLabel('Resources')
      .type(`${linodes[0].label}{enter}`)
      .click();

    cy.get('button[aria-label="Clear"]').eq(1).click();

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
    cy.visitWithLogin('monitor');

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
