/**
 * @file Mocks feature flag clientstream request across all tests.
 */

import { mockGetFeatureFlagClientstream } from 'support/intercepts/feature-flags';

/**
 * Mocks LaunchDarkly feature flag clientstream request across all tests.
 *
 * This prevents our feature flag mocks from being overridden.
 */
export const mockFeatureFlagClientstream = () => {
  beforeEach(() => {
    mockGetFeatureFlagClientstream();
  });
};
