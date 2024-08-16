import { randomItem } from 'support/util/random';
import { buildArray, shuffleArray } from './arrays';
import { getNewRegionLabel } from 'src/components/RegionSelect/RegionSelect.utils';

import type { Capabilities, Region } from '@linode/api-v4';

/**
 * Extended Region type to assist with Cloud Manager-specific label handling.
 *
 * Cloud Manager mutates region labels in many places throughout the app, and
 * the `ExtendedRegion` type gives us a way to access a region's original label
 * and its label as displayed by Cloud Manager.
 *
 * The Cloud Manager specific label is accessible via the `label` property,
 * and the unmodified region label provided via the API can be accessed using
 * the `apiLabel` property.
 *
 * @see {@link https://github.com/linode/manager/pull/10740|Cloud Manager PR #10740}
 * @see {@link src/queries/regions/regions.ts}
 */
export interface ExtendedRegion extends Region {
  /** Region label as defined by API v4. */
  apiLabel: string;
}

/**
 * Determines whether a region object is a `Region` or `ExtendedRegion` instance.
 *
 * @param region - `Region` or `ExtendedRegion` object.
 *
 * @returns `true` if `region` is an `ExtendedRegion` instance, `false` otherwise.
 */
export const isExtendedRegion = (
  region: Region | ExtendedRegion
): region is ExtendedRegion => {
  if ('apiLabel' in region) {
    return true;
  }
  return false;
};

/**
 * Returns an `ExtendedRegion` object for the given `Region`.
 *
 * If the given region object is already an `ExtendedRegion` (i.e. it has an
 * `apiLabel` property), then it will be returned unmodified.
 *
 * @param region - Region to extend.
 *
 * @returns `ExtendedRegion` object for `region`.
 */
export const extendRegion = (
  region: Region | ExtendedRegion
): ExtendedRegion => {
  if (!isExtendedRegion(region)) {
    return {
      ...region,
      label: getNewRegionLabel(region),
      apiLabel: region.label,
    };
  }
  return region;
};

/**
 * Returns a `Region` object for the given `ExtendedRegion`.
 *
 * @param extendedRegion - Extended region from which to create `Region`.
 *
 * @returns `Region` object for `extendedRegion`.
 */
export const getRegionFromExtendedRegion = (
  extendedRegion: ExtendedRegion
): Region => {
  return {
    id: extendedRegion.id,
    label: extendedRegion.apiLabel,
    country: extendedRegion.country,
    capabilities: extendedRegion.capabilities,
    placement_group_limits: extendedRegion.placement_group_limits,
    status: extendedRegion.status,
    resolvers: extendedRegion.resolvers,
    site_type: extendedRegion.site_type,
  };
};

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
export const getOverrideRegion = (): ExtendedRegion | undefined => {
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
export const regions: ExtendedRegion[] = Cypress.env(
  'cloudManagerRegions'
) as ExtendedRegion[];

/**
 * Linode region(s) exposed to Cypress for testing.
 *
 * This may be a subset of `regions` in order to test functionality for specific
 * regions.
 */
export const getTestableRegions = (): ExtendedRegion[] => {
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
 *
 * @returns Extended Cloud Manager Region instance for region with the given ID.
 */
export const getRegionById = (
  id: string,
  searchRegions?: Region[]
): ExtendedRegion => {
  const region = (searchRegions ?? regions).find(
    (findRegion: Region) => findRegion.id === id
  );
  if (!region) {
    throw new Error(`Unable to find region by ID. Unknown ID '${id}'.`);
  }
  return extendRegion(region);
};

/**
 * Returns an object describing a Cloud Manager region with the given label.
 *
 * If no known region exists with the given human-readable label, an error is
 * thrown.
 *
 * @param label - Label (API or Cloud-specific) of the region to find.
 * @param searchRegions - Optional array of Regions from which to search.
 *
 * @throws When no region exists in the `regions` array with the given label.
 */
export const getRegionByLabel = (label: string, searchRegions?: Region[]) => {
  const region = (searchRegions ?? regions).find((findRegion: Region) => {
    const extendedFindRegion = extendRegion(findRegion);
    return (
      extendedFindRegion.label === label ||
      extendedFindRegion.apiLabel === label
    );
  });
  if (!region) {
    throw new Error(
      `Unable to find region by label. Unknown region label '${label}'.`
    );
  }
  return extendRegion(region);
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
  return regions.filter((region: ExtendedRegion) =>
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
export const chooseRegion = (options?: ChooseRegionOptions): ExtendedRegion => {
  return extendRegion(randomItem(resolveSearchRegions(options)));
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
): ExtendedRegion[] => {
  if (count < 0) {
    throw new Error(
      'Unable to choose regions. The desired number of regions must be 0 or greater'
    );
  }

  const searchRegions = [
    ...shuffleArray(resolveSearchRegions(options, false)),
    // If an override region is specified, insert it into the array last so it pops first.
    ...(getOverrideRegion() ? resolveSearchRegions(options, true) : []),
  ];

  if (searchRegions.length < count) {
    throw new Error(
      `Unable to choose regions. The desired number of regions exceeds the number of known regions that meet the required criteria (${regions.length})`
    );
  }

  return buildArray(count, () => extendRegion(searchRegions.pop()!));
};

/**
 * Executes a test for each Linode region exposed to Cypress.
 */
export const testRegions = (
  description: string,
  testCallback: (region: ExtendedRegion) => void
) => {
  getTestableRegions().forEach((region: ExtendedRegion) => {
    it(`${description} (${region.id})`, () => testCallback(region));
  });
};

/**
 * Describes a group of test runs for each Linode region exposed to Cypress.
 */
export const describeRegions = (
  description: string,
  describeCallback: (region: ExtendedRegion) => void
) => {
  getTestableRegions().forEach((region: ExtendedRegion) => {
    describe(`${description} (${region.id})`, () => describeCallback(region));
  });
};
