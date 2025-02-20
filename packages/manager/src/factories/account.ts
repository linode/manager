import Factory from 'src/factories/factoryProxy';

import type {
  Account,
  ActivePromotion,
  RegionalNetworkUtilization,
} from '@linode/api-v4/lib/account/types';

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
    'Akamai Cloud Pulse',
    'Block Storage',
    'Cloud Firewall',
    'Disk Encryption',
    'Kubernetes',
    'Linodes',
    'LKE HA Control Planes',
    'Machine Images',
    'Managed Databases',
    'Managed Databases Beta',
    'NETINT Quadra T1U',
    'NodeBalancers',
    'Object Storage Access Key Regions',
    'Object Storage Endpoint Types',
    'Object Storage',
    'Placement Group',
    'Vlans',
    'Kubernetes Enterprise',
  ],
  city: 'Philadelphia',
  company: Factory.each((i) => `company-${i}`),
  country: 'US',
  credit_card: {
    expiry: '01/2028',
    last_four: '1111',
  },
  email: 'my-email@example.com',
  euuid: Factory.each((i) => `278EC57D-7424-4B3A-B35C3CE395787567-${i}`),
  first_name: 'John',
  last_name: 'Doe',
  phone: '1215550001',
  state: 'PA',
  tax_id: '111111111',
  zip: '19106',
});

export const accountTransferFactory = Factory.Sync.makeFactory<RegionalNetworkUtilization>(
  {
    billable: 0,
    quota: 25000, // GB
    region_transfers: [
      {
        billable: 0,
        id: 'id-cgk',
        quota: 10000, // GB
        used: 8500, // GB
      },
      {
        billable: 0,
        id: 'br-gru',
        quota: 15000, // GB
        used: 500, // GB
      },
    ],
    used: 9000, // GB
  }
);

export const accountTransferNoResourceFactory = Factory.Sync.makeFactory<RegionalNetworkUtilization>(
  {
    billable: 0,
    quota: 0,
    region_transfers: [],
    used: 0,
  }
);
