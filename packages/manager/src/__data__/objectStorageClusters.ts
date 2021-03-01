import { ObjectStorageCluster } from '@linode/api-v4/lib/object-storage';

export const objectStorageClusters: ObjectStorageCluster[] = [
  {
    id: 'us-east-1',
    region: 'us-east',
    status: 'available',
    domain: 'us-east-1.linodeobjects.com',
    static_site_domain: 'website-us-east-1.linodeobjects.com',
  },
  {
    id: 'eu-central-1',
    region: 'eu-central',
    status: 'available',
    domain: 'eu-central-1.linodeobjects.com',
    static_site_domain: 'website-eu-central-1.linodeobjects.com',
  },
  {
    id: 'ap-south-1',
    region: 'ap-south',
    status: 'available',
    domain: 'ap-south-1.linodeobjects.com',
    static_site_domain: 'website-ap-south-1.linodeobjects.com',
  },
];
