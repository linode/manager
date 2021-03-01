import {
  createImage as _create,
  deleteImage as _delete,
  getImage,
  getImages,
  Image,
  updateImage as _update,
} from '@linode/api-v4/lib/images';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import {
  createImageActions,
  deleteImageActions,
  requestImageForStoreActions,
  requestImagesActions,
  updateImageActions,
} from './image.actions';

// Currently there is an API bug in which the pagination of GET /images is
// validated differently than other entity types, and only 100 Images may be
// requested at at time.
const getAllImages = getAll<Image>(getImages, 100);

export const requestImages = createRequestThunk(requestImagesActions, () =>
  getAllImages().then((response) => response.data)
);

export const createImage = createRequestThunk(
  createImageActions,
  ({ diskID, label, description }) => _create(diskID, label, description)
);

export const requestImageForStore = createRequestThunk(
  requestImageForStoreActions,
  (imageID) => getImage(imageID)
);

export const updateImage = createRequestThunk(
  updateImageActions,
  ({ label, description, imageID }) => _update(imageID, label, description)
);

export const deleteImage = createRequestThunk(
  deleteImageActions,
  ({ imageID }) => _delete(imageID)
);
