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

export const banners = [
  testApiBanner,
  testBillingBanner,
  testAbuseBanner,
];
