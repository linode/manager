import {
  selectServiceName,
  selectTimeRange,
  selectAndVerifyResource,
  assertSelections,
  resetDashboardAndVerifyPage,
} from 'support/util/cloudpulse';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import {
  interceptCloudPulseServices,
  interceptCreateMetrics,
  interceptGetDashboards,
  interceptGetMetricDefinitions,
  mockJWSToken,
  mockLinodeDashboardServicesResponse,
} from 'support/intercepts/cloudpulseAPIHandler';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import type { Flags } from 'src/featureFlags';
import { createMetricResponse } from '@src/factories/widget';
import { mockGetLinodes } from 'support/intercepts/linodes';
import {
  mockGetAccount,
} from 'support/intercepts/account';
import { ui } from 'support/ui';
import { accountFactory ,dashboardFactory,kubeLinodeFactory,linodeFactory,metricDefinitionsFactory} from 'src/factories';
import { timeRange, widgetDetails, granularity } from 'support/constants/widget-service';
/**
 * This test suite focuses on the standard operations and verifications for the Cloudpulse dashboard.
 *
 * The tests include verifying the visibility and functionality of the Cloud View when the feature flag is disabled,
 * clearing and resetting dashboard preferences, and ensuring that specific selections such as dashboard name,
 * time range, region, and resources are correctly applied and verified.
 *
 * Each test case checks the correctness and persistence of these configurations to ensure that the
 * dashboard behaves as expected under various conditions.
 */



 const dashboardName = 'Linode Dashboard';
 const region = 'US, Chicago, IL (us-ord)';
 const actualRelativeTimeDuration = timeRange.Last24Hours;
const resource = 'test1';
const mockKubeLinode = kubeLinodeFactory.build();
const mockLinode = linodeFactory.build({
  label: resource,
  id: mockKubeLinode.instance_id ?? undefined,
});
const mockAccount = accountFactory.build();

const y_labels = [
  'system_cpu_utilization_ratio',
  'system_memory_usage_bytes',
  'system_network_io_bytes_total',
  'system_disk_operations_total',
];
const linodeWidgets = widgetDetails.linode;
const widgetLabels: string[] = linodeWidgets.map(widget => widget.title);
const metricsLabels: string[] = linodeWidgets.map(widget => widget.name);
const dashboard = dashboardFactory(dashboardName, widgetLabels, metricsLabels, y_labels).build();
const metricDefinitions = metricDefinitionsFactory(widgetLabels, metricsLabels).build();
describe('Standard Dashboard Filter Application and Configuration Tests', () => {
  beforeEach(() => {
    cy.visitWithLogin('monitor/cloudpulse');
    mockAppendFeatureFlags({
      aclp: makeFeatureFlagData<Flags['aclp']>({ beta: true, enabled: true }),
    }).as('getFeatureFlags');
    mockGetAccount(mockAccount).as('getAccount'); // this enables the account to have capability for Akamai Cloud Pulse
    mockGetFeatureFlagClientstream();
    interceptGetMetricDefinitions(metricDefinitions);
    interceptGetDashboards(dashboard).as('dashboard');
    interceptCloudPulseServices('linode').as('services');
    mockGetLinodes([mockLinode]).as('getLinodes');
    const responsePayload = createMetricResponse(actualRelativeTimeDuration, granularity.Min5);
    interceptCreateMetrics(responsePayload).as('metricAPI');
    mockJWSToken();
    mockLinodeDashboardServicesResponse(dashboard);
  });


  it('should verify cloudpulse availability when feature flag is set to false', () => {
    mockAppendFeatureFlags({
      aclp: makeFeatureFlagData<Flags['aclp']>({ beta: true, enabled: false }),
    });
    mockGetFeatureFlagClientstream();
    cy.visitWithLogin('monitor/cloudpulse'); // since we disabled the flag here, we should have not found
    cy.findByText('Not Found').should('be.visible'); // not found
  });

  it('Check the Linode Dashboard for the required global filter.', () => {
     resetDashboardAndVerifyPage(dashboardName);
     selectServiceName(dashboardName);
     assertSelections(dashboardName);
     selectTimeRange(actualRelativeTimeDuration, Object.values(timeRange));
     assertSelections(actualRelativeTimeDuration);
     ui.regionSelect.find().click().type(`${region}{enter}`);
     assertSelections(region);
     selectAndVerifyResource(resource);
  });
});

