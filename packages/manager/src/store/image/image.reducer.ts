import { Image } from 'linode-js-sdk/lib/images';
import { clone } from 'ramda';
import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import {
  addOrUpdateImage,
  getImagesFailure,
  getImagesRequest,
  getImagesSuccess,
  removeImage
} from './image.actions';

/**
 * State
 */

export interface State {
  error?: Partial<{
    read: Linode.ApiFieldError[];
    create: Linode.ApiFieldError[];
    delete: Linode.ApiFieldError[];
    update: Linode.ApiFieldError[];
  }>;
  data: Record<string, Image>;
  results: number;
  lastUpdated: number;
  loading: boolean;
}

export const defaultState: State = {
  loading: true,
  lastUpdated: 0,
  results: 0,
  data: {}
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, getImagesRequest)) {
    return {
      ...state,
      loading: true
    };
  }

  if (isType(action, getImagesSuccess)) {
    const { payload } = action;

    return {
      ...state,
      loading: false,
      lastUpdated: Date.now(),
      data: payload.data.reduce((acc, eachImage) => {
        acc[eachImage.id] = eachImage;
        return acc;
      }, {}),
      results: payload.results
    };
  }

  if (isType(action, getImagesFailure)) {
    const { payload } = action;

    return {
      ...state,
      loading: false,
      error: {
        read: payload
      }
    };
  }

  if (isType(action, removeImage)) {
    const { payload } = action;
    /**
     * Events provide a numeric ID, but the actual ID is a string. So we have to respond
     * to both potentials.
     * ![Hard to work](https://media.giphy.com/media/juSraIEmIN5eg/giphy.gif)
     */
    const id = typeof payload === 'string' ? payload : `private/${payload}`;

    const dataClone = clone(state.data!);
    delete dataClone[id];

    return {
      ...state,
      data: dataClone,
      results: Object.keys(dataClone).length,
      lastUpdated: Date.now()
    };
  }

  if (isType(action, addOrUpdateImage)) {
    const { payload } = action;

    const dataClone = clone(state.data!);
    dataClone[payload.id] = payload;

    return {
      ...state,
      data: dataClone,
      results: Object.keys(dataClone).length,
      lastUpdated: Date.now()
    };
  }

  return state;
};

export default reducer;
