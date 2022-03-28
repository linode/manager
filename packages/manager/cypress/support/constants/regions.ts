/**
 * @file Constants related to Linode regions.
 */

/**
 * Map of region IDs and their corresponding human-readable names.
 */
export const regionsMap = {
  'us-central': 'Dallas, TX',
  'us-west': 'Fremont, CA',
  'us-southeast': 'Atlanta, GA',
  'us-east': 'Newark, NJ',
  'eu-west': 'London, UK',
  'ap-south': 'Singapore, SG',
  'eu-central': 'Frankfurt, DE',
  'ap-northeast': 'Tokyo 2, JP',
  'ca-central': 'Toronto, ON',
  'ap-west': 'Mumbai, IN',
  'ap-southeast': 'Sydney, AU',
};

/**
 * Array of region IDs.
 */
export const regions = Object.keys(regionsMap);

/**
 * Array of human-readable region names.
 */
export const regionsFriendly = Object.keys(regionsMap).map(
  (regionKey: string) => regionsMap[regionKey]
);
