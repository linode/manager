import { Kernel } from '@linode/api-v4';
import Factory from 'src/factories/factoryProxy';

export const kernelFactory = Factory.Sync.makeFactory<Kernel>({
  id: Factory.each((i) => `kernel-${i}`),
  label: Factory.each((i) => `kernel-${i}`),
  version: '1.0.0',
  kvm: true,
  architecture: 'x86_64',
  pvops: false,
  deprecated: false,
  built: '2009-10-26T04:00:00',
});
