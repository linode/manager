import { cancelTransfer, getEntityTransfers, getLinodes } from '@linode/api-v4';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';

import { isTestLabel } from './common';

import type { EntityTransfer, Linode } from '@linode/api-v4';

/**
 * Cancel all entity transfers whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when entity transfers have been cancelled or rejects on HTTP error.
 */
export const cancelAllTestEntityTransfers = async (): Promise<void> => {
  const linodes = await depaginate<Linode>((page: number) =>
    getLinodes({ page, page_size: pageSize })
  );

  const entityTransfers = (
    await depaginate<EntityTransfer>((page: number) =>
      getEntityTransfers({ page, page_size: pageSize })
    )
  ).filter(
    (entityTransfer: EntityTransfer) => entityTransfer.status === 'pending'
  );

  const deletionPromises = entityTransfers.map(
    async (entityTransfer: EntityTransfer) => {
      const transferLinodeIds: number[] =
        entityTransfer?.entities?.linodes || [];
      const allLinodesAreTestLinodes = transferLinodeIds.every(
        (transferLinodeId: number) => {
          const existingLinode = linodes.find(
            (linode: Linode) => linode.id === transferLinodeId
          );
          return !!existingLinode && isTestLabel(existingLinode.label);
        }
      );
      if (allLinodesAreTestLinodes) {
        await cancelTransfer(entityTransfer.token);
      }
    }
  );

  await Promise.all(deletionPromises);
};
