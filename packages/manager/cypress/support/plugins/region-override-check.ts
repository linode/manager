import { CypressPlugin } from './plugin';

export const regionOverrideCheck: CypressPlugin = (_on, config): void => {
  // const overrideRegionId = config.env?.['CY_TEST_REGION'];
  // const overrideRegionName = config.env?.['CY_TEST_REGION_NAME'];
  // // If one environment variable is specified but not the other, warn that they
  // // will be disregarded.
  // if (
  //   (!!overrideRegionId && !overrideRegionName) ||
  //   (!overrideRegionId && !!overrideRegionName)
  // ) {
  //   console.warn(
  //     'Either CY_TEST_REGION_ID or CY_TEST_REGION_NAME was specified, but not both.'
  //   );
  //   console.warn(
  //     'CY_TEST_REGION_ID and CY_TEST_REGION_NAME must both be specified in order to override test region selection behavior.'
  //   );
  // }
};
