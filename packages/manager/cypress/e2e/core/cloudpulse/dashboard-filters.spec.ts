import {
  selectServiceName,
  selectRegion,
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
  interceptCreateMetrics,
  interceptGetDashboards,
  interceptGetMetricDefinitions,
} from 'support/intercepts/cloudpulseAPIHandler';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import type { Flags } from 'src/featureFlags';
import { createMetricResponse } from '@src/factories/widgetFactory'
import { mockGetLinodes } from 'support/intercepts/linodes';
import {
  accountFactory,
  kubeLinodeFactory,
  linodeFactory,
} from 'src/factories';

import {
  mockGetAccount,
  mockCancelAccount,
  mockCancelAccountError,
} from 'support/intercepts/account';
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
describe('Standard Dashboard Filter Application and Configuration Tests', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      aclp: makeFeatureFlagData<Flags['aclp']>({ beta: true, enabled: true }),
    });
    mockGetFeatureFlagClientstream();
    cy.visitWithLogin('monitor/cloudpulse');
    interceptGetMetricDefinitions().as('dashboardMetricsData');
    interceptGetDashboards().as('dashboard');
    mockGetLinodes([mockLinode]).as('getLinodes');
    const responsePayload = createMetricResponse(actualRelativeTimeDuration, granularity.Min5);
    interceptCreateMetrics(responsePayload).as('metricAPI');
    const mockAccount = accountFactory.build();
    mockGetAccount(mockAccount).as('getAccount'); // this enables the account to have capability for Akamai Cloud Pulse
  });


  it.only('should verify cloudpulse availability when feature flag is set to false', () => {
    mockAppendFeatureFlags({
      aclp: makeFeatureFlagData<Flags['aclp']>({ beta: true, enabled: false }),
    });
    mockGetFeatureFlagClientstream();
    cy.visitWithLogin('monitor/cloudpulse'); // since we disabled the flag here, we should have not found
    cy.findByText('Not Found').should('be.visible'); // not found
  });

  it('should clear the preferences of the dashboard', () => {
    resetDashboardAndVerifyPage(dashboardName);
  });
  it('should set and verify dashboard name', () => {
    selectServiceName(dashboardName);
    assertSelections(dashboardName);
  });
  it('should set and verify time range', () => {
    selectTimeRange(actualRelativeTimeDuration);
    assertSelections(actualRelativeTimeDuration);
  });

  it('should set and verify region', () => {
    selectRegion(region);
    assertSelections(region);
  });

  it('should set and verify resource', () => {
    selectAndVerifyResource(resource);
  });
});
