import {
  createImage as _create,
  getImage,
  getImages,
  Image,
  updateImage as _update
} from 'linode-js-sdk/lib/images';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import {
  createImageActions,
  requestImageForStoreActions,
  requestImagesActions,
  updateImageActions
} from './image.actions';

const getAllImages = getAll<Image>(getImages);

export const requestImages = createRequestThunk(requestImagesActions, () =>
  getAllImages().then(response => response.data)
);

export const createImage = createRequestThunk(
  createImageActions,
  ({ diskID, label, description }) =>
    _create(diskID, label, description).then(response => response.data)
);

export const requestImageForStore = createRequestThunk(
  requestImageForStoreActions,
  imageID => getImage(imageID)
);

export const updateImage = createRequestThunk(
  updateImageActions,
  ({ label, description, imageID }) =>
    _update(imageID, label, description).then(response => response.data)
);
