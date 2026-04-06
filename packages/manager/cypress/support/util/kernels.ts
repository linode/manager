/**
 * @file Utilities for Linode kernel retrieval and management.
 */

import { getLinodeKernels } from '@linode/api-v4';
import { pageSize } from 'support/constants/api';

import { depaginate } from './paginate';

import type { Kernel } from '@linode/api-v4';

/**
 * Fetches all Linode kernels.
 *
 * @returns Promise that resolves to an array of `Kernel` instances.
 */
export const fetchAllKernels = async (): Promise<Kernel[]> => {
  return depaginate<Kernel>((page) =>
    getLinodeKernels({ page, page_size: pageSize })
  );
};

/**
 * Finds a `Kernel` in an array of `Kernel`s by its ID.
 *
 * @param kernels - Array of Kernels from which to search.
 * @param kernelId - ID of Kernel to find.
 *
 * @throws When a Kernel with ID `kernelId` does not exist in `kernels`.
 *
 * @return Kernel instance with given ID.
 */
export const findKernelById = (kernels: Kernel[], kernelId: string) => {
  const kernel = kernels.find((kernel) => kernel.id === kernelId);
  if (!kernel) {
    throw new Error(`Unable to find a Linode kernel with ID '${kernelId}'`);
  }
  return kernel;
};
