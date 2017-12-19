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

export const xsaBanner = {
  entity: {
    id: 1234,
    label: 'my-linode',
    type: 'linode',
    url: '/linode/instances/1234',
  },
  type: 'xsa',
  when: '2017-01-01T00:00:01',
};

export const outstandingBalanceBanner = {
  entity: {
    id: null,
    label: 'user@email.com',
    type: 'account',
    url: '/account/settings',
  },
  type: 'outstanding_balance',
  when: null,
};

export const scheduledRebootBanner = {
  entity: {
    id: 1234,
    label: 'my-linode',
    type: 'linode',
    url: '/linode/instances/1234',
  },
  type: 'scheduled_reboot',
  when: '2017-12-31T23:59:59',
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
