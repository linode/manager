export const apiTestRegion = {
  id: 'us-east-1a',
  country: 'US',
  label: 'Newark, NJ',
};

export const testRegion = {
  ...apiTestRegion,
  _polling: false,
};

export const regions = {
  'us-east-1a': testRegion,
  // TODO: The alpha env only has Newark, but maybe we want to add more DCs
  // here later anyway
};
