import {
  Account,
  ActivePromotion,
  RegionalNetworkUtilization,
} from '@linode/api-v4/lib/account/types';
import * as Factory from 'factory.ts';

export const promoFactory = Factory.Sync.makeFactory<ActivePromotion>({
  credit_monthly_cap: '20.00',
  credit_remaining: '20.00',
  description: 'Signed up via Ubuntu 20.04 announcement $20/60 days',
  expire_dt: '2025-05-01T03:59:59',
  image_url: '',
  service_type: 'all',
  summary: 'UBUNTU20',
  this_month_credit_remaining: '20.00',
});

export const accountFactory = Factory.Sync.makeFactory<Account>({
  active_promotions: [
    {
      credit_monthly_cap: '20.00',
      credit_remaining: '20.00',
      description: 'Signed up via Ubuntu 20.04 announcement $20/60 days',
      expire_dt: '2025-05-01T03:59:59',
      image_url: '',
      service_type: 'all',
      summary: 'UBUNTU20',
      this_month_credit_remaining: '20.00',
    },
  ],
  active_since: '2018-07-03T12:15:25',
  address_1: '249 Arch St',
  address_2: '',
  balance: 0.0,
  balance_uninvoiced: 0.0,
  billing_source: 'linode',
  capabilities: [
    'Linodes',
    'NodeBalancers',
    'Block Storage',
    'Object Storage',
    'Kubernetes',
    'LKE HA Control Planes',
  ],
  city: 'Colorado',
  company: 'xrTHcxhFdaDW1XyYWSNWsccDa07iUy',
  country: 'CA',
  credit_card: {
    expiry: '01/2018',
    last_four: '1111',
  },
  email: 'my-email@example.com',
  euuid: '278EC57D-7424-4B3A-B35C3CE395787567',
  first_name: 'XRbganOEO',
  last_name: 'demo2',
  phone: '19005553221',
  state: 'BC',
  tax_id: '111111111',
  zip: '19106',
});

export const accountTransferFactory = Factory.Sync.makeFactory<RegionalNetworkUtilization>(
  {
    billable: 0,
    quota: 25000,
    used: 9000,
    region_transfers: [
      { id: 'id-cgk', billable: 0, quota: 10000, used: 8500 },
      { id: 'br-gru', billable: 0, quota: 15000, used: 500 },
    ],
  }
);
