import {
  createImage as _create,
  getImages,
  Image
} from 'linode-js-sdk/lib/images';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { createImageActions, requestImagesActions } from './image.actions';

const getAllImages = getAll<Image>(getImages);

export const requestImages = createRequestThunk(requestImagesActions, () =>
  getAllImages().then(response => response.data)
);

export const createImage = createRequestThunk(
  createImageActions,
  ({ diskID, label, description }) =>
    _create(diskID, label, description).then(response => response.data)
);
