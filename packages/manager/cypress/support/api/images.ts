import { deleteImage, getImages } from '@linode/api-v4';
import { imageFactory } from '@src/factories';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';

import { isTestLabel } from './common';

import type { Image } from '@linode/api-v4';

export const createMockImage = (
  data?: Image,
  eol = null,
  label = 'cy-test-image',
  id = 'private/99999999'
) => {
  return makeResourcePage(
    imageFactory.buildList(1, { eol, id, label, ...data })
  );
};

/**
 * Deletes all Images whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when Images have been deleted.
 */
export const deleteAllTestImages = async (): Promise<void> => {
  const images = await depaginate<Image>((page: number) =>
    getImages({ page, page_size: pageSize })
  );
  const imageDeletePromises = images
    .filter((image: Image) => isTestLabel(image.label))
    .map((image: Image) => deleteImage(image.id));

  await Promise.all(imageDeletePromises);
};
