import Factory from 'src/factories/factoryProxy';

import type { Kernel } from '@linode/api-v4/lib/linodes/types';

export const LinodeKernelFactory = Factory.Sync.makeFactory<Kernel>({
  architecture: 'x86_64',
  built: '2018-01-01T00:01:01',
  deprecated: false,
  id: Factory.each((i) => i.toString()),
  kvm: false,
  label: Factory.each((i) => `kernel-${i}`),
  pvops: false,
  version: '4.15.7',
});
