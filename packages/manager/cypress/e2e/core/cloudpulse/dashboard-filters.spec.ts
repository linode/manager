import {
  selectServiceName,
  selectRegion,
  selectTimeRange,
  selectAndVerifyResource,
  assertSelections,
  visitCloudPulseWithFeatureFlagsDisabled,
  dashboardName,
  actualRelativeTimeDuration,
  region,
  resource,
  resetDashboardAndVerifyPage,
  initializeMockUserData,
} from 'support/util/cloudpulse';
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

describe('Standard Dashboard Filter Application and Configuration Tests', () => {
  beforeEach(() => {
    initializeMockUserData();
  });

  it('should verify cloudpulse availability when feature flag is set to false', () => {
    visitCloudPulseWithFeatureFlagsDisabled();
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
