import { Factory } from '@linode/utilities';

import type { Flags, ProductInformationBannerFlag } from 'src/featureFlags';

export const productInformationBannerFactory =
  Factory.Sync.makeFactory<ProductInformationBannerFlag>({
    bannerLocation: 'Object Storage',
    decoration: {
      important: 'true',
      variant: 'warning',
    },
    expirationDate: '2030-08-01',
    key: Factory.each((i) => `product-information-banner-${i}`),
    // safe
    message:
      'Store critical data and media files with S3-Compatible Object Storage. <a target="_blank" href="https://techdocs.akamai.com/cloud-computing/docs/object-storage">New Availability: Atlanta</a>',
  });

export const flagsFactory = Factory.Sync.makeFactory<Partial<Flags>>({
  aclp: { beta: true, enabled: true },
  aclpServices: {
    linode: {
      alerts: { beta: true, enabled: true },
      metrics: { beta: true, enabled: true },
    },
    firewall: {
      alerts: { beta: true, enabled: true },
      metrics: { beta: true, enabled: true },
    },
    dbaas: {
      alerts: { beta: true, enabled: true },
      metrics: { beta: true, enabled: true },
    },
    nodebalancer: {
      alerts: { beta: true, enabled: true },
      metrics: { beta: true, enabled: true },
    },
  },
  aclpResourceTypeMap: [
    {
      dimensionKey: 'LINODE_ID',
      maxResourceSelections: 10,
      serviceType: 'linode',
    },
    {
      dimensionKey: 'cluster_id',
      maxResourceSelections: 10,
      serviceType: 'dbaas',
    },
    {
      dimensionKey: 'cluster_id',
      maxResourceSelections: 10,
      serviceType: 'nodebalancer',
    },
    {
      dimensionKey: 'firewall',
      maxResourceSelections: 10,
      serviceType: 'firewall',
    },
  ],
});
