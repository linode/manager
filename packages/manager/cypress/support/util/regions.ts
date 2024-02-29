import { randomItem } from 'support/util/random';
import { buildArray, shuffleArray } from './arrays';

import type { Capabilities, Region } from '@linode/api-v4';

/**
 * Regions that cannot be selected using `chooseRegion()` and `chooseRegions()`.
 *
 * This is useful for regions which have capabilities that are required for tests,
 * but do not have capacity, resulting in 400 responses from the API.
 *
 * In the future we may be able to leverage the API to dynamically exclude regions
 * that are lacking capacity.
 */
const disallowedRegionIds = [
  // Tokyo, JP
  'ap-northeast',

  // Washington, DC
  'us-iad',
];

/**
 * Returns an object describing a Cloud Manager region if specified by the user.
 *
 * If the user has not specified an override region to use, `undefined` is
 * returned.
 *
 * @returns Override Cloud Manager region, or `undefined`.
 */
export const getOverrideRegion = (): Region | undefined => {
  const overrideRegionId = Cypress.env('CY_TEST_REGION');

  try {
    return getRegionById(overrideRegionId);
  } catch (e) {
    return undefined;
  }
};

/**
 * All Linode regions available to the current Cloud Manager user.
 *
 * Retrieved via Linode APIv4 during Cypress start-up.
 */
export const regions: Region[] = Cypress.env('cloudManagerRegions') as Region[];

/**
 * Linode region(s) exposed to Cypress for testing.
 *
 * This may be a subset of `regions` in order to test functionality for specific
 * regions.
 */
export const getTestableRegions = (): Region[] => {
  const overrideRegion = getOverrideRegion();
  if (overrideRegion) {
    return [overrideRegion];
  }
  return regions;
};

/**
 * Returns an object describing a Cloud Manager region with the given ID.
 *
 * If no known region exists with the given ID, an error is thrown.
 *
 * @param id - ID of the region to find.
 * @param searchRegions - Optional array of Regions from which to search.
 *
 * @throws When no region exists in the `regions` array with the given ID.
 */
export const getRegionById = (id: string, searchRegions?: Region[]) => {
  const region = (searchRegions ?? regions).find(
    (findRegion: Region) => findRegion.id === id
  );
  if (!region) {
    throw new Error(`Unable to find region by ID. Unknown ID '${id}'.`);
  }
  return region;
};

/**
 * Returns an object describing a Cloud Manager region with the given label.
 *
 * If no known region exists with the given human-readable label, an error is
 * thrown.
 *
 * @param label - Label of the region to find.
 * @param searchRegions - Optional array of Regions from which to search.
 *
 * @throws When no region exists in the `regions` array with the given label.
 */
export const getRegionByLabel = (label: string, searchRegions?: Region[]) => {
  const region = (searchRegions ?? regions).find(
    (findRegion: Region) => findRegion.label === label
  );
  if (!region) {
    throw new Error(
      `Unable to find region by label. Unknown region label '${label}'.`
    );
  }
  return region;
};

interface ChooseRegionOptions {
  /**
   * If specified, the region returned will support the defined capabilities
   * @example 'Managed Databases'
   */
  capabilities?: Capabilities[];

  /**
   * Regions from which to choose. If unspecified, Regions exposed by the API will be used.
   */
  regions?: Region[];
}

/**
 * Returns `true` if the given Region has all of the given capabilities.
 *
 * @param region - Region to check capabilities.
 * @param capabilities - Capabilities to check.
 *
 * @returns `true` if `region` has all of the given capabilities.
 */
const regionHasCapabilities = (
  region: Region,
  capabilities: Capabilities[]
): boolean => {
  return capabilities.every((capability) =>
    region.capabilities.includes(capability)
  );
};

/**
 * Returns an array of Region objects that have all of the given capabilities.
 *
 * @param regions - Regions from which to search.
 * @param capabilities - Capabilities to check.
 *
 * @returns Array of Region objects containing the required capabilities.
 */
const regionsWithCapabilities = (
  regions: Region[],
  capabilities: Capabilities[]
): Region[] => {
  return regions.filter((region: Region) =>
    regionHasCapabilities(region, capabilities)
  );
};

/**
 * Returns an array of Region objects that meet the given criteria.
 *
 * @param options - Object describing Region selection criteria.
 * @param detectOverrideRegion - Whether override region should be detected and applied.
 *
 * @throws If no regions meet the desired criteria.
 * @throws If an override region is specified which does not meet the given criteria.
 *
 * @returns Array of Region objects that meet criteria specified by `options` param.
 */
const resolveSearchRegions = (
  options?: ChooseRegionOptions,
  detectOverrideRegion: boolean = true
): Region[] => {
  const requiredCapabilities = options?.capabilities ?? [];
  const overrideRegion = getOverrideRegion();

  // If the user has specified an override region for this run, it takes precedent
  // over any other specified criteria.
  if (overrideRegion && detectOverrideRegion) {
    // TODO Consider skipping instead of failing when test isn't applicable to override region.
    if (!regionHasCapabilities(overrideRegion, requiredCapabilities)) {
      throw new Error(
        `Override region ${overrideRegion.id} (${
          overrideRegion.label
        }) does not support one or more capabilities: ${requiredCapabilities.join(
          ', '
        )}`
      );
    }
    if (disallowedRegionIds.includes(overrideRegion.id)) {
      throw new Error(
        `Override region ${overrideRegion.id} (${overrideRegion.label}) is disallowed for testing due to capacity limitations.`
      );
    }
    return [overrideRegion];
  }

  const capableRegions = regionsWithCapabilities(
    options?.regions ?? regions,
    requiredCapabilities
  ).filter((region: Region) => !disallowedRegionIds.includes(region.id));

  if (!capableRegions.length) {
    throw new Error(
      `No regions are available with the required capabilities: ${requiredCapabilities.join(
        ', '
      )}`
    );
  }

  return capableRegions;
};

/**
 * Returns a known Cloud Manager region at random, or returns a user-chosen
 * region if one was specified.
 *
 * Region selection can be overridden via the `CY_TEST_REGION` environment
 * variable.
 *
 * @param options - Region selection options.
 *
 * @returns Object describing a Cloud Manager region to use during tests.
 */
export const chooseRegion = (options?: ChooseRegionOptions): Region => {
  return randomItem(resolveSearchRegions(options));
};

/**
 * Returns an array of unique Cloud Manager regions at random.
 *
 * If an override region is defined via the `CY_TEST_REGION` environment
 * variable, the first item in the array will be the override region, and
 * subsequent items will be chosen at random.
 *
 * @param count - Number of Regions to include in the returned array.
 * @param options - Region selection options.
 *
 * @throws When `count` is less than 0.
 * @throws When there are not enough regions to satisfy the given `count`.
 *
 * @returns Array of Cloud Manager Region objects.
 */
export const chooseRegions = (
  count: number,
  options?: ChooseRegionOptions
): Region[] => {
  if (count < 0) {
    throw new Error(
      'Unable to choose regions. The desired number of regions must be 0 or greater'
    );
  }

  const searchRegions = [
    // If an override region is specified, insert it into the array first.
    ...(getOverrideRegion() ? resolveSearchRegions(options, true) : []),
    ...shuffleArray(resolveSearchRegions(options, false)),
  ];

  if (searchRegions.length < count) {
    throw new Error(
      `Unable to choose regions. The desired number of regions exceeds the number of known regions that meet the required criteria (${regions.length})`
    );
  }

  return buildArray(count, (i) => searchRegions.pop()!);
};

/**
 * Executes a test for each Linode region exposed to Cypress.
 */
export const testRegions = (
  description: string,
  testCallback: (region: Region) => void
) => {
  getTestableRegions().forEach((region: Region) => {
    it(`${description} (${region.id})`, () => testCallback(region));
  });
};

/**
 * Describes a group of test runs for each Linode region exposed to Cypress.
 */
export const describeRegions = (
  description: string,
  describeCallback: (region: Region) => void
) => {
  getTestableRegions().forEach((region: Region) => {
    describe(`${description} (${region.id})`, () => describeCallback(region));
  });
};
