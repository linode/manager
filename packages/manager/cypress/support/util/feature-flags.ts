/**
 * @file Types and utilities related to Cloud Manager feature flags.
 */

/**
 * Data for a Cloud Manager feature flag.
 */
export interface FeatureFlagData<T> {
  flagVersion: number;
  trackEvents: boolean;
  value: T;
  variation: number;
  version: number;
}

/**
 * Cloud Manager feature flag response.
 */
export interface FeatureFlagResponseData {
  [key: string]: FeatureFlagData<any>;
}

/**
 * Returns an object containing feature flag data.
 *
 * @param value - Feature flag value.
 * @param variation - Feature flag variation. Optional.
 * @param version - Version shared by flag data. Optional.
 * @param trackEvents - Whether events are tracked. Optional.
 * @param flagVersion - Flag version. Optional.
 */
export const makeFeatureFlagData = <T>(
  value: T,
  variation?: number,
  version?: number,
  trackEvents?: boolean,
  flagVersion?: number
): FeatureFlagData<T> => {
  const defaultFeatureFlagData = {
    flagVersion: 1,
    trackEvents: false,
    variation: 0,
    version: 1,
  };

  return {
    flagVersion: flagVersion ?? defaultFeatureFlagData.flagVersion,
    trackEvents: trackEvents ?? defaultFeatureFlagData.trackEvents,
    value,
    variation: variation ?? defaultFeatureFlagData.variation,
    version: version ?? defaultFeatureFlagData.version,
  };
};
