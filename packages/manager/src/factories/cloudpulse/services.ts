import { Factory } from '@linode/utilities';

import type { ServiceTypes } from '@linode/api-v4';

export const serviceTypesFactory = Factory.Sync.makeFactory<ServiceTypes>({
  label: Factory.each((i) => `Factory ServiceType-${i}`),
  service_type: Factory.each((i) => `Factory ServiceType-${i}`),
});
