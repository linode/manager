import {
  selectServiceName,
  selectTimeRange,
  selectAndVerifyResource,
  assertSelections,
  dashboardName,
  actualRelativeTimeDuration,
  region,
  resource,
  resetDashboardAndVerifyPage,
} from 'support/util/cloudpulse';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { granularity } from 'support/constants/widget-service';
import {
  interceptCloudPulseServices,
  interceptCreateMetrics,
  interceptGetDashboards,
  interceptGetMetricDefinitions,
} from 'support/intercepts/cloudpulseAPIHandler';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import type { Flags } from 'src/featureFlags';
import { createMetricResponse } from '@src/factories/widget';
import { mockGetLinodes } from 'support/intercepts/linodes';
import {
  mockGetAccount,
} from 'support/intercepts/account';
import {
  timeRange,
} from 'support/constants/widget-service';
import { ui } from 'support/ui';
import { accountFactory ,dashboardFactory,kubeLinodeFactory,linodeFactory,metricDefinitionsFactory} from 'src/factories';
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
const mockKubeLinode = kubeLinodeFactory.build();
const mockLinode = linodeFactory.build({
  label: "test1",
  id: mockKubeLinode.instance_id ?? undefined,
});
const widgetLabels = [
  'CPU utilization',
  'Memory Usage',
  'Network Traffic',
  'Disk I/O',
];
const metricsLabels = [
  'system_cpu_utilization_percent',
  'system_memory_usage_by_resource',
  'system_network_io_by_resource',
  'system_disk_operations_total',
];
const y_labels = [
  'system_cpu_utilization_ratio',
  'system_memory_usage_bytes',
  'system_network_io_bytes_total',
  'system_disk_operations_total',
];
const dashboard = dashboardFactory(dashboardName,widgetLabels,metricsLabels,y_labels).build();
const metricDefinitions = metricDefinitionsFactory(widgetLabels,metricsLabels).build();
describe('Standard Dashboard Filter Application and Configuration Tests', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclp: makeFeatureFlagData<Flags['aclp']>({ beta: true, enabled: true }),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream();
    cy.visitWithLogin('monitor/cloudpulse');
    interceptGetMetricDefinitions(metricDefinitions);
    interceptGetDashboards(dashboard).as('dashboard');
    interceptCloudPulseServices('linode').as('services');
    mockGetLinodes([mockLinode]).as('getLinodes');
    const responsePayload = createMetricResponse(actualRelativeTimeDuration, granularity.Min5);
    interceptCreateMetrics(responsePayload).as('metricAPI');
    const mockAccount = accountFactory.build();
    mockGetAccount(mockAccount).as('getAccount'); // this enables the account to have capability for Akamai Cloud Pulse
  });


  it('should verify cloudpulse availability when feature flag is set to false', () => {
    mockAppendFeatureFlags({
      aclp: makeFeatureFlagData<Flags['aclp']>({ beta: true, enabled: false }),
    });
    mockGetFeatureFlagClientstream();
    cy.visitWithLogin('monitor/cloudpulse'); // since we disabled the flag here, we should have not found
    cy.findByText('Not Found').should('be.visible'); // not found
  });

  it('should clear the preferences of the dashboard', () => {
    cy.log("dashboardName****",dashboardName)
    resetDashboardAndVerifyPage(dashboardName);
  });
  it('should set and verify dashboard name', () => {
    selectServiceName(dashboardName);
    assertSelections(dashboardName);
  });
  it('should set and verify time range', () => {
    selectTimeRange(actualRelativeTimeDuration, Object.values(timeRange));
    assertSelections(actualRelativeTimeDuration);
  });

  it('should set and verify region', () => {
    ui.regionSelect.find().click().type(`${region}{enter}`);
    assertSelections(region);
  });

  it('should set and verify resource', () => {
    selectAndVerifyResource(resource);
  });
});
