import { getAll, deleteById, isTestEntity, makeTestLabel } from './common';

export const makeImageLabel = makeTestLabel;

export const getImages = () => getAll('images');
export const deleteImageById = (imageId: number) =>
  deleteById('images', imageId);

export const deleteAllTestImages = () => {
  getImages().then(resp => {
    resp.body.data.forEach(image => {
      if (isTestEntity(image)) {
        deleteImageById(image.id);
      }
    });
  });
};
