import {
  Account,
  ActivePromotion,
  NetworkUtilization,
} from '@linode/api-v4/lib/account/types';
import * as Factory from 'factory.ts';

export const promoFactory = Factory.Sync.makeFactory<ActivePromotion>({
  image_url: '',
  summary: 'UBUNTU20',
  description: 'Signed up via Ubuntu 20.04 announcement $20/60 days',
  expire_dt: '2025-05-01T03:59:59',
  credit_monthly_cap: '20.00',
  credit_remaining: '20.00',
  this_month_credit_remaining: '20.00',
  service_type: 'all',
});

export const accountFactory = Factory.Sync.makeFactory<Account>({
  company: 'xrTHcxhFdaDW1XyYWSNWsccDa07iUy',
  email: 'my-email@example.com',
  first_name: 'XRbganOEO',
  last_name: 'demo2',
  address_1: '249 Arch St',
  address_2: '',
  city: 'Colorado',
  state: 'asdf',
  zip: '19106',
  country: 'AQ',
  phone: '19005553221',
  balance: 0.0,
  tax_id: '111111111',
  credit_card: {
    last_four: '1111',
    expiry: '01/2018',
  },
  balance_uninvoiced: 0.0,
  active_since: '2018-07-03T12:15:25',
  capabilities: [
    'Linodes',
    'NodeBalancers',
    'Block Storage',
    'Object Storage',
    'Kubernetes',
  ],
  active_promotions: [
    {
      image_url: '',
      summary: 'UBUNTU20',
      description: 'Signed up via Ubuntu 20.04 announcement $20/60 days',
      expire_dt: '2025-05-01T03:59:59',
      credit_monthly_cap: '20.00',
      credit_remaining: '20.00',
      this_month_credit_remaining: '20.00',
      service_type: 'all',
    },
    {
      image_url: '',
      summary: 'BAD_PROMO',
      description:
        'This promotion is invalid since it has an expiration of null',
      expire_dt: null,
      credit_monthly_cap: '20.00',
      credit_remaining: '20.00',
      this_month_credit_remaining: '20.00',
      service_type: 'all',
    },
  ],
  euuid: '278EC57D-7424-4B3A-B35C3CE395787567',
});

export const accountTransferFactory = Factory.Sync.makeFactory<NetworkUtilization>(
  {
    used: 50,
    quota: 11347,
    billable: 0,
  }
);
