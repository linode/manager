import { Reducer } from 'redux';
import { EntityState } from 'src/store/types';
import updateOrAdd from 'src/utilities/updateOrAdd';
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
export type State = EntityState<Linode.Image>;

export const defaultState: State = {
  entities: [],
  results: [],
  error: undefined,
  loading: true,
  lastUpdated: 0
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
      entities: payload,
      results: payload.map(t => t.id)
    };
  }

  if (isType(action, getImagesFailure)) {
    const { payload } = action;

    return {
      ...state,
      loading: false,
      error: payload
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
    const updated = state.entities.filter(image => image.id !== id);

    return {
      ...state,
      entities: updated,
      results: updated.map(i => i.id)
    };
  }

  if (isType(action, addOrUpdateImage)) {
    const { payload } = action;
    const updated = updateOrAdd(payload, state.entities);
    return {
      ...state,
      entities: updated,
      results: updated.map(i => i.id)
    };
  }

  return state;
};

export default reducer;
