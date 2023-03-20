import { EntityTransfer, Linode } from '@linode/api-v4/types';
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
  const entityTransfers = (
    await depaginate<EntityTransfer>((page: number) =>
      getEntityTransfers({ page_size: 500, page })
    )
  ).filter(
    (entityTransfer: EntityTransfer) => entityTransfer.status === 'pending'
  );

  for (const entityTransfer of entityTransfers) {
    // eslint-disable-next-line no-await-in-loop
    const isTest = await areAllLinodesWithTestLabel(
      entityTransfer?.entities?.linodes
    );
    if (isTest) {
      // We want to send these requests sequentially
      // to avoid overloading the API.
      // eslint-disable-next-line no-await-in-loop
      await cancelTransfer(entityTransfer.token);
    }
  }
};

const areAllLinodesWithTestLabel = async (
  linodeIds: number[]
): Promise<boolean> => {
  if (linodeIds?.length > 0) {
    const linodes = await Promise.all(
      linodeIds.map((id: number) => getLinode(id))
    );
    return linodes.every((linode: Linode) => isTestLabel(linode.label));
  }
  return false;
};
