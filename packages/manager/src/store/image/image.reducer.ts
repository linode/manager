import produce from 'immer';
import { Image } from 'linode-js-sdk/lib/images';
import { clone } from 'ramda';
import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import {
  createImageActions,
  removeImage,
  requestImagesActions,
  upsertImage
} from './image.actions';

import { EntitiesAsObjectState } from '../types';

export type State = EntitiesAsObjectState<Image>;

export const defaultState: State = {
  loading: true,
  lastUpdated: 0,
  results: 0,
  data: {},
  error: {},
  listOfIDsInOriginalOrder: []
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  return produce(state, draft => {
    if (isType(action, requestImagesActions.started)) {
      draft.loading = true;
    }

    if (isType(action, requestImagesActions.done)) {
      const { result } = action.payload;

      draft.loading = false;
      draft.lastUpdated = Date.now();
      draft.listOfIDsInOriginalOrder = result.map(eachImage => eachImage.id);
      (draft.data = result.reduce((acc, eachImage) => {
        if (eachImage.label.match(/kube/i)) {
          // NOTE: Temporarily hide public Kubernetes images until ImageSelect redesign.
          return acc;
        }
        acc[eachImage.id] = eachImage;
        return acc;
      }, {})),
        (draft.results = Object.keys(result).length);
    }

    if (isType(action, requestImagesActions.failed)) {
      const { error } = action.payload;

      draft.loading = false;
      draft.error.read = error;
    }

    if (isType(action, createImageActions.started)) {
      draft.error.create = undefined;
    }

    if (isType(action, createImageActions.done)) {
      const { result } = action.payload;

      draft.lastUpdated = Date.now();
      draft.data[result.id] = result;
      draft.results = Object.keys(draft.data).length;
      draft.listOfIDsInOriginalOrder = [
        ...state.listOfIDsInOriginalOrder,
        result.id
      ];
    }

    if (isType(action, createImageActions.failed)) {
      const { error } = action.payload;

      draft.error.create = error;
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

      draft.data = dataClone;
      draft.listOfIDsInOriginalOrder = state.listOfIDsInOriginalOrder.filter(
        eachID => eachID !== id
      );
      draft.results = Object.keys(dataClone).length;
      if (draft.results !== state.results) {
        // something was actually updated
        draft.lastUpdated = Date.now();
      }
    }

    if (isType(action, upsertImage)) {
      const image = action.payload;

      const dataClone = clone(state.data!);
      dataClone[image.id] = image;

      draft.data = dataClone;
      /**
       * in the case of updating and adding, we're just going to add the new ID to the
       * end of the list. Set() will make sure to get rid of the dupes in the list
       */
      draft.listOfIDsInOriginalOrder = [
        ...new Set([...state.listOfIDsInOriginalOrder, image.id])
      ];
      draft.results = Object.keys(dataClone).length;
      draft.lastUpdated = Date.now();
    }
  });
};

export default reducer;
