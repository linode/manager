import { imageFactory } from '@src/factories';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { getImages, Image, deleteImage } from '@linode/api-v4';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';
import { isTestLabel } from './common';

export const createMockImage = (
  data?,
  eol = null,
  label = 'cy-test-image',
  id = 'private/99999999'
) => {
  return makeResourcePage(
    imageFactory.buildList(1, { eol, label, id, ...data })
  );
};

/**
 * Deletes all Images whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when Images have been deleted.
 */
export const deleteAllTestImages = async (): Promise<void> => {
  const images = await depaginate<Image>((page: number) =>
    getImages({ page_size: pageSize, page })
  );
  const imageDeletePromises = images
    .filter((image: Image) => isTestLabel(image.label))
    .map((image: Image) => deleteImage(image.id));

  await Promise.all(imageDeletePromises);
};
