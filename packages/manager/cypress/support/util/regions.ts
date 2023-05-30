import { randomItem } from 'support/util/random';

/**
 * Describes a region shown in Cloud Manager when creating resources, etc.
 */
export interface CloudRegion {
  /// Region identifier, as used by Linode API v4.
  id: string;

  /// Region name, as displayed in Cloud Manager UI.
  name: string;

  /// Region group?.
  /// group: string;
}

/**
 * Returns an object describing a Cloud Manager region if specified by the user.
 *
 * If the user has not specified an override region to use, `undefined` is
 * returned.
 *
 * @returns Override Cloud Manager region, or `undefined`.
 */
export const getOverrideRegion = (): CloudRegion | undefined => {
  const overrideRegionId = Cypress.env('CY_TEST_REGION_ID');
  const overrideRegionName = Cypress.env('CY_TEST_REGION_NAME');

  if (overrideRegionId && overrideRegionName) {
    return {
      id: overrideRegionId,
      name: overrideRegionName,
    };
  }

  return undefined;
};

/**
 * Array of known regions available from within Cloud Manager.
 */
export const regions: CloudRegion[] = [
  { id: 'ap-northeast', name: 'Tokyo, JP' },
  { id: 'ap-south', name: 'Singapore, SG' },
  { id: 'ap-southeast', name: 'Sydney, AU' },
  { id: 'ap-west', name: 'Mumbai, IN' },
  { id: 'ca-central', name: 'Toronto, CA' },
  { id: 'eu-central', name: 'Frankfurt, DE' },
  { id: 'eu-west', name: 'London, UK' },
  { id: 'us-central', name: 'Dallas, TX' },
  { id: 'us-east', name: 'Newark, NJ' },
  { id: 'us-southeast', name: 'Atlanta, GA' },
  { id: 'us-west', name: 'Fremont, CA' },

  // If the user specified an override region, it should be included in this array
  // so that `getRegionById()` and similar helpers function as expected.
  ...(getOverrideRegion() ? [getOverrideRegion() as CloudRegion] : []),
];

/**
 * Returns an object describing a Cloud Manager region with the given ID.
 *
 * If no known region exists with the given ID, an error is thrown.
 *
 * @throws When no region exists in the `regions` array with the given ID.
 */
export const getRegionById = (id: string) => {
  const region = regions.find(
    (findRegion: CloudRegion) => findRegion.id === id
  );
  if (!region) {
    throw new Error(`Unable to find region by ID. Unknown ID '${id}'.`);
  }
  return region;
};

/**
 * Returns an object describing a Cloud Manager region with the given name.
 *
 * If no known region exists with the given human-readable name, an error is
 * thrown.
 *
 * @throws When no region exists in the `regions` array with the given name.
 */
export const getRegionByName = (name: string) => {
  const region = regions.find(
    (findRegion: CloudRegion) => findRegion.name === name
  );
  if (!region) {
    throw new Error(`Unable to find region by name. Unknown name '${name}'.`);
  }
  return region;
};

/**
 * Returns a known Cloud Manager region at random, or returns a user-chosen
 * region if one was specified.
 *
 * Region selection can be configured via the `CY_TEST_REGION_ID` and
 * `CY_TEST_REGION_NAME` environment variables. Both must be specified in
 * order to override the region that is returned by this function.
 *
 * @returns Object describing a Cloud Manager region to use during tests.
 */
export const chooseRegion = (): CloudRegion => {
  const overrideRegion = getOverrideRegion();
  return overrideRegion ? overrideRegion : randomItem(regions);
};
