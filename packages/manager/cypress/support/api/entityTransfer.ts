import { EntityTransfer } from '@linode/api-v4/types';
import {
  getEntityTransfers,
  cancelTransfer,
  getLinode,
} from '@linode/api-v4/lib';
import { depaginate } from 'support/util/paginate';
import { isTestLabel } from './common';

/**
 * Cancel all entity transfers whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when entity transfers have been cancelled or rejects on HTTP error.
 */
export const cancelAllTestEntityTransfers = async (): Promise<void> => {
  const entityTransfers = await depaginate<EntityTransfer>((page: number) =>
    getEntityTransfers({ page_size: 500, page })
  );
  const testEntityTransfers: EntityTransfer[] = [];
  for (let i = 0; i < entityTransfers.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const isTest = await areAllLinodesWithTestLabel(
      entityTransfers[i]?.entities?.linodes
    );
    if (isTest) {
      testEntityTransfers.push(entityTransfers[i]);
    }
  }
  for (const testEntityTransfer of testEntityTransfers) {
    // We want to send these requests sequentially
    // to avoid overloading the API.
    // eslint-disable-next-line no-await-in-loop
    await cancelTransfer(testEntityTransfer.token);
  }
};

const areAllLinodesWithTestLabel = async (
  linodeIds: number[]
): Promise<boolean> => {
  if (linodeIds?.length > 0) {
    const filteredLinodeIds = await linodeFilter(linodeIds);
    // If all the linodes are with test label, the length of
    // the filtered array should be the same as that of the
    // original one
    return filteredLinodeIds.length == linodeIds.length;
  }
  return false;
};

const linodeFilter = async (linodeIds: number[]) => {
  const results = await Promise.all(
    linodeIds.map(async (linodeId: number) => {
      try {
        const linode = await getLinode(linodeId);
        return isTestLabel(linode.label);
      } catch (error: any) {
        const notFoundErrorMessage = 'Request failed with status code 404';
        // If the linode instance is not found, it should
        // be safe to cancel the entity transfer
        return error?.message === notFoundErrorMessage;
      }
    })
  );
  const filteredIds = linodeIds.filter((_v, index) => results[index]);
  return filteredIds;
};
