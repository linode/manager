/**
 * @file Types and utilities related to Cloud Manager feature flags.
 */

import type { Flags } from 'src/featureFlags';

const defaultFeatureFlagData = {
  flagVersion: 1,
  trackEvents: false,
  variation: 0,
  version: 1,
};

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
 * Cloud Manager feature flag mock data.
 *
 * This allows feature flag data to be expressed more flexibly, but must be
 * converted to a `FeatureFlagResponseData` object before it can be used in a
 * mocked LaunchDarkly response.
 *
 * See also `getResponseDataFromMockData()`.
 */
export type FeatureFlagMockData = Partial<
  Record<
    keyof Flags,
    Partial<FeatureFlagData<Partial<Flags[keyof Flags]>> | Flags[keyof Flags]>
  >
>;

/**
 * Cloud Manager feature flag response.
 *
 * This data requires that all feature flag properties (`value`, `version`,
 * `variation`, etc.) are specified. See also `FeatureFlagMockData` for a more
 * flexible way to define and represent feature flag data.
 */
export interface FeatureFlagResponseData {
  [key: string]: FeatureFlagData<any>;
}

/**
 * Determines whether the given data is a partial representation of `FeatureFlagData`.
 *
 * @returns `true` if `data` is a partial feature flag object, `false` otherwise.
 */
export const isPartialFeatureFlagData = <T>(
  data: any
): data is Partial<FeatureFlagData<T>> => {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return true;
  }
  return false;
};

/**
 * Returns a new `FeatureFlagResponseData` object for the given
 * `FeatureFlagMockData` object.
 *
 * @param data - Feature flag mock data from which to create response data.
 *
 * @returns Feature flag response data that can be used for mocking purposes.
 */
export const getResponseDataFromMockData = <T>(data: FeatureFlagMockData) => {
  return Object.keys(data).reduce<Record<string, FeatureFlagData<T>>>(
    (output, cur: keyof FeatureFlagMockData) => {
      const mockData = output[cur];
      if (isPartialFeatureFlagData<T>(mockData)) {
        output[cur] = {
          ...defaultFeatureFlagData,
          ...mockData,
        };
        return output;
      } else {
        output[cur] = makeFeatureFlagData<T>(mockData);
      }
      return output;
    },
    data as Record<string, FeatureFlagData<T>>
  );
};

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
  return {
    flagVersion: flagVersion ?? defaultFeatureFlagData.flagVersion,
    trackEvents: trackEvents ?? defaultFeatureFlagData.trackEvents,
    value,
    variation: variation ?? defaultFeatureFlagData.variation,
    version: version ?? defaultFeatureFlagData.version,
  };
};
