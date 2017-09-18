export const apiTestKernel = {
  created: '2015-05-04T09:43:23',
  current: true,
  deprecated: false,
  description: null,
  id: 'linode/latest_64',
  kvm: true,
  label: '4.0.1-x86_64-linode55',
  version: '4.0.1',
  architecture: 'x86_64',
  xen: false,
};

export const testKernel = {
  ...apiTestKernel,
  _polling: false,
};

export const kernels = {
  'linode/latest_64': testKernel,
  'linode/latest': {
    ...testKernel,
    id: 'linode/latest',
    label: '4.0.1-x86-linode55',
    architecture: 'x86_64',
  },
};
