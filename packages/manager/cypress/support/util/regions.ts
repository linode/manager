import { randomItem } from 'support/util/random';

import type { Capabilities, Region } from '@linode/api-v4';

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
 * @throws When no region exists in the `regions` array with the given ID.
 */
export const getRegionById = (id: string) => {
  const region = regions.find((findRegion: Region) => findRegion.id === id);
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
 * @throws When no region exists in the `regions` array with the given label.
 */
export const getRegionByLabel = (label: string) => {
  const region = regions.find(
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
   * If specified, the region returned will support the defined capability
   * @example 'Managed Databases'
   */
  capability?: Capabilities;
}

/**
 * Returns a known Cloud Manager region at random, or returns a user-chosen
 * region if one was specified.
 *
 * Region selection can be configured via the `CY_TEST_REGION` environment
 * variable. If defined, the region returned by this function will be
 * overridden using the chosen region.
 *
 * @returns Object describing a Cloud Manager region to use during tests.
 */
export const chooseRegion = (options?: ChooseRegionOptions): Region => {
  const overrideRegion = getOverrideRegion();

  if (overrideRegion) {
    return overrideRegion;
  }

  if (options?.capability) {
    const regionsWithCapability = regions.filter((region) =>
      region.capabilities.includes(options.capability!)
    );

    return randomItem(regionsWithCapability);
  }

  return randomItem(regions);
};

/**
 * Returns an array of unique Cloud Manager regions at random.
 *
 * If an override region is defined via the `CY_TEST_REGION` environment
 * variable, the first item in the array will be the override region, and
 * subsequent items will be chosen at random.
 *
 * @param count - Number of Regions to include in the returned array.
 *
 * @throws When `count` is less than 0.
 * @throws When there are not enough regions to satisfy the given `count`.
 *
 * @returns Array of Cloud Manager Region objects.
 */
export const chooseRegions = (count: number): Region[] => {
  if (count < 0) {
    throw new Error(
      'Unable to choose regions. The desired number of regions must be 0 or greater'
    );
  }
  if (regions.length < count) {
    throw new Error(
      `Unable to choose regions. The desired number of regions exceeds the number of known regions (${regions.length})`
    );
  }
  const overrideRegion = getOverrideRegion();

  return new Array(count).fill(null).reduce((acc: Region[], _cur, index) => {
    const chosenRegion: Region = ((): Region => {
      if (index === 0 && overrideRegion) {
        return overrideRegion;
      }
      // Get an array of regions that have not already been selected.
      const unusedRegions = regions.filter(
        (regionA: Region) =>
          !!regions.find((regionB: Region) => regionA.id !== regionB.id)
      );
      return randomItem(unusedRegions);
    })();
    acc.push(chosenRegion);
    return acc;
  }, []);
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
