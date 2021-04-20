import { Image } from '@linode/api-v4/lib/images';
import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import {
  createImageActions,
  deleteImageActions,
  removeImage,
  requestImageForStoreActions,
  requestImagesActions,
  updateImageActions,
  uploadImageActions,
  upsertImage,
} from './image.actions';
import {
  createDefaultState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart,
  removeMany,
  setError,
} from '../store.helpers.tmp';

import { MappedEntityState2 as MappedEntityState } from '../types';

export type State = MappedEntityState<Image>;

export const defaultState: State = createDefaultState();

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, requestImagesActions.started)) {
    return onStart(state);
  }

  if (isType(action, requestImagesActions.done)) {
    const { result } = action.payload;
    const images = result.filter((thisImage) => {
      // NOTE: Temporarily hide public Kubernetes images.
      return !thisImage.is_public || !thisImage.label.match(/kube/i);
    });
    return onGetAllSuccess(images, state, Object.keys(images).length);
  }

  if (isType(action, requestImagesActions.failed)) {
    const { error } = action.payload;

    return onError({ read: error }, state);
  }

  if (isType(action, requestImageForStoreActions.started)) {
    // Do nothing here, this isn't a full request
    return state;
  }

  if (isType(action, requestImageForStoreActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, requestImageForStoreActions.failed)) {
    // Do nothing; don't want to set the global error state
    // if a single request fails.
    return state;
  }

  if (isType(action, updateImageActions.started)) {
    return setError({ update: undefined }, state);
  }

  if (isType(action, updateImageActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, updateImageActions.failed)) {
    const { error } = action.payload;

    return onError({ update: error }, state);
  }

  if (isType(action, createImageActions.started)) {
    return setError({ create: undefined }, state);
  }

  if (isType(action, createImageActions.done)) {
    const newImage = action.payload.result;
    return onCreateOrUpdate(newImage, state);
  }

  if (isType(action, createImageActions.failed)) {
    const { error } = action.payload;

    return onError({ create: error }, state);
  }

  if (isType(action, uploadImageActions.started)) {
    return setError({ create: undefined }, state);
  }

  if (isType(action, uploadImageActions.done)) {
    // We're throwing away the upload_to string here,
    // but there's no reason for that to be stored.
    const newImage = action.payload.result.image;
    return onCreateOrUpdate(newImage, state);
  }

  if (isType(action, uploadImageActions.failed)) {
    const { error } = action.payload;

    return onError({ create: error }, state);
  }

  if (isType(action, removeImage)) {
    const { payload } = action;
    /**
     * Events provide a numeric ID, but the actual ID is a string. So we have to respond
     * to both potentials.
     * ![Hard to work](https://media.giphy.com/media/juSraIEmIN5eg/giphy.gif)
     */
    const id = typeof payload === 'string' ? payload : `private/${payload}`;

    return removeMany([id], state);
  }

  if (isType(action, upsertImage)) {
    const { payload } = action;
    return onCreateOrUpdate(payload, state);
  }

  if (isType(action, deleteImageActions.started)) {
    return setError({ delete: undefined }, state);
  }

  if (isType(action, deleteImageActions.done)) {
    const { imageID } = action.payload.params;
    return onDeleteSuccess(imageID, state);
  }

  if (isType(action, deleteImageActions.failed)) {
    const { error } = action.payload;

    return onError({ delete: error }, state);
  }

  return state;
};

export default reducer;
