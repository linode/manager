export const apiTestDatacenter = {
  id: 'newark',
  country: 'US',
  label: 'Newark, NJ',
};

export const testDatacenter = {
  ...apiTestDatacenter,
  _polling: false,
};

export const datacenters = {
  newark: testDatacenter,
  // TODO: The alpha env only has Newark, but maybe we want to add more DCs
  // here later anyway
};
