export const testApiBanner = {
  entity: {
    id: 1234,
    type: 'ticket',
    label: 'testing ticket',
  },
  type: 'important_ticket',
  when: null,
};

export const testBillingBanner = {
  ...testApiBanner,
  entity: {
    id: 1235,
    label: 'Please update your billing information.',
  },
};

export const testAbuseBanner = {
  ...testApiBanner,
  entity: {
    id: 1235,
    label: 'ToS Violation',
  },
  type: 'abuse_ticket',
};

export const testAbuseBanner2 = {
  ...testAbuseBanner,
  entity: {
    id: 1236,
  },
};

const testOutageBanner1 = {
  when: null,
  entity: {
    label: null,
    id: 'us-east-1a',
    type: 'region',
    url: '/regions/us-east-1a',
  },
  type: 'outage',
};

const testOutageBanner2 = {
  ...testOutageBanner1,
  entity: {
    ...testOutageBanner1.entity,
    id: 'us-south-1a',
    url: '/regions/us-south-1a',
  },
};

export const importantBanner = [
  testApiBanner,
];

export const importantBanners = [
  testApiBanner,
  testBillingBanner,
];

export const abuseBanner = [
  testAbuseBanner,
];

export const abuseBanners = [
  testAbuseBanner,
  testAbuseBanner2,
];

export const outageBanners = [
  testOutageBanner1,
  testOutageBanner2,
];

export const banners = [
  testApiBanner,
  testBillingBanner,
  testAbuseBanner,
];
