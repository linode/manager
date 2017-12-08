export const testApiBanner = {
  entity: {
    id: 1234,
    type: 'ticket',
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

export const singleBanner = [
  testApiBanner,
];

export const banners = [
  testApiBanner,
  testBillingBanner,
];
