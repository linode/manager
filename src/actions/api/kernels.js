import { makeFetchPage, makeFetchAll } from '~/api-store';

export const UPDATE_KERNELS = '@@kernels/UPDATE_KERNELS';

export const kernelConfig = {
  singular: 'kernel',
  plural: 'kernels',
  actions: { updateItems: UPDATE_KERNELS },
};

export const fetchKernels = makeFetchPage(kernelConfig);
export const fetchAllKernels = makeFetchAll(kernelConfig, fetchKernels);
