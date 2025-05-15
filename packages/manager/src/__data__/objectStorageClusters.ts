import type { ObjectStorageCluster } from '@linode/api-v4/lib/object-storage';

export const objectStorageClusters: ObjectStorageCluster[] = [
  {
    domain: 'us-east-1.linodeobjects.com',
    id: 'us-east-1',
    region: 'us-east',
    static_site_domain: 'website-us-east-1.linodeobjects.com',
    status: 'available',
  },
  {
    domain: 'eu-central-1.linodeobjects.com',
    id: 'eu-central-1',
    region: 'eu-central',
    static_site_domain: 'website-eu-central-1.linodeobjects.com',
    status: 'available',
  },
  {
    domain: 'ap-south-1.linodeobjects.com',
    id: 'ap-south-1',
    region: 'ap-south',
    static_site_domain: 'website-ap-south-1.linodeobjects.com',
    status: 'available',
  },
];
