import { imageFactory } from '@src/factories';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { getAll, deleteById, isTestEntity } from './common';

export const getImages = (page: number = 1) => getAll(`images?page=${page}`);

export const createMockImage = (
  data?,
  label = 'cy-test-image',
  id = 'private/99999999'
) => {
  return makeResourcePage(imageFactory.buildList(1, { label, id, ...data }));
};

export const deleteImageById = (imageId: number) =>
  deleteById('images', imageId);

export const deleteAllTestImages = () => {
  getImages().then((resp) => {
    const pages = resp.body.pages;
    for (let page = 1; page <= pages; page++) {
      getImages(page).then((resp) => {
        resp.body.data.forEach((image) => {
          if (isTestEntity(image)) {
            deleteImageById(image.id);
          }
        });
      });
    }
  });
};
