import { getAll, deleteById, isTestEntity, makeTestLabel } from './common';

export const makeImageLabel = makeTestLabel;

export const getImages = (page: number = 1) => getAll(`images?page=${page}`);

export const deleteImageById = (imageId: number) =>
  deleteById('images', imageId);

export const deleteAllTestImages = () => {
  getImages().then(resp => {
    const pages = resp.body.pages;
    for (let page = 1; page <= pages; page++) {
      getImages(page).then(resp => {
        resp.body.data.forEach(image => {
          if (isTestEntity(image)) {
            deleteImageById(image.id);
          }
        });
      });
    }
  });
};
