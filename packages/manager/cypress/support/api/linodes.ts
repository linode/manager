import { deleteLinode, getLinodes } from '@linode/api-v4';
import { linodeFactory } from '@linode/utilities';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';

import { deleteById, isTestLabel } from './common';

import type { Linode } from '@linode/api-v4';

export const createMockLinodeList = (data?: {}, listNumber: number = 1) => {
  return makeResourcePage(
    linodeFactory.buildList(listNumber, {
      ...data,
    })
  );
};

export const deleteLinodeById = (linodeId: number) =>
  deleteById('linode/instances', linodeId);

/**
 * Deletes all Linodes whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when Linodes have been deleted or rejects on HTTP error.
 */
export const deleteAllTestLinodes = async (): Promise<void> => {
  const linodes = await depaginate<Linode>((page: number) =>
    getLinodes({ page, page_size: pageSize })
  );

  const deletePromises = linodes
    .filter((linode: Linode) => isTestLabel(linode.label))
    .map((linode: Linode) => deleteLinode(linode.id));

  await Promise.all(deletePromises);
};
