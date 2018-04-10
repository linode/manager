import { BANNER_TYPES } from '~/constants';

const {
  OUTAGE,
  REBOOT_SCHEDULED,
  BALANCE_OUTSTANDING,
  TICKET_IMPORTANT,
  TICKET_ABUSE,
} = BANNER_TYPES;

export const testApiBanner = {
  entity: {
    id: 1234,
    type: 'ticket',
    label: 'testing ticket',
  },
  type: TICKET_IMPORTANT,
  when: null,
};

export const testBillingBanner = {
  ...testApiBanner,
  entity: {
    id: 1235,
    label: 'Please update your billing information.',
  },
};

export const outstandingBalanceBanner = {
  entity: {
    id: null,
    label: 'user@email.com',
    type: 'account',
    url: '/account/settings',
  },
  type: BALANCE_OUTSTANDING,
  when: null,
};

export const scheduledRebootBanner = {
  entity: {
    id: 1234,
    label: 'my-linode',
    type: 'linode',
    url: '/linode/instances/1234',
  },
  type: REBOOT_SCHEDULED,
  when: '2017-12-31T23:59:59',
};

export const testAbuseBanner = {
  ...testApiBanner,
  entity: {
    id: 1235,
    label: 'ToS Violation',
  },
  type: TICKET_ABUSE,
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
    id: 'us-east',
    type: 'region',
    url: '/regions/us-east',
  },
  type: OUTAGE,
};

const testOutageBanner2 = {
  ...testOutageBanner1,
  entity: {
    ...testOutageBanner1.entity,
    id: 'us-central',
    url: '/regions/us-central',
  },
};

export const testGlobalBanner = {
  entity: null,
  message: 'The new linode cloud manager is in the works!',
  type: 'linode',
  when: '2017-12-22T05:00:00',
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

export const globalBanner = [
  testGlobalBanner,
];

export const banners = [
  testApiBanner,
  testBillingBanner,
  testAbuseBanner,
  testGlobalBanner,
];
