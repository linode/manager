import { Reducer } from 'redux';
import { EntityError, EntityState, HasNumericID } from 'src/store/types';
import updateById from 'src/utilities/updateById';
import updateOrAdd from 'src/utilities/updateOrAdd';
import { isType } from 'typescript-fsa';
import {
  addNotificationsToLinodes,
  createLinodeActions,
  deleteLinode,
  deleteLinodeActions,
  getLinodesActions,
  updateLinode,
  updateLinodeActions,
  updateMultipleLinodes,
  upsertLinode
} from './linodes.actions';

import {
  addNotificationsToLinodes as _addNotificationsToLinodes,
  LinodeWithMaintenance
} from './linodes.helpers';

const getId = <E extends HasNumericID>({ id }: E) => id;

/**
 * State
 */
export type State = EntityState<LinodeWithMaintenance, EntityError>;

export const defaultState: State = {
  results: [],
  entities: [],
  loading: true,
  lastUpdated: 0,
  error: undefined
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  /** Get ALL */
  if (isType(action, getLinodesActions.started)) {
    return {
      ...state,
      loading: true
    };
  }

  if (isType(action, getLinodesActions.done)) {
    const {
      payload: { result }
    } = action;
    return {
      ...state,
      entities: result.data,
      results: result.data.map(getId),
      lastUpdated: Date.now(),
      loading: false
    };
  }

  if (isType(action, getLinodesActions.failed)) {
    const { error } = action.payload;

    return {
      ...state,
      error: {
        read: error
      },
      loading: false
    };
  }

  if (isType(action, upsertLinode)) {
    const { payload } = action;
    const entities = updateOrAdd(payload, state.entities);

    return {
      ...state,
      entities,
      results: entities.map(getId)
    };
  }

  if (isType(action, updateMultipleLinodes)) {
    const { payload } = action; /** list of successfully updated Linodes */
    if (payload && payload.length === 0) {
      return state;
    }
    return {
      ...state,
      entities: [
        ...state.entities.filter(eachEntity => {
          return !payload.some(eachLinode => {
            return eachLinode.id === eachEntity.id;
          });
        }),
        ...payload
      ]
    };
  }

  if (isType(action, deleteLinode)) {
    const { payload } = action;
    const { entities, results } = state;

    return {
      ...state,
      entities: entities.filter(linode => linode.id !== payload),
      results: results.filter(id => id !== payload)
    };
  }

  if (isType(action, updateLinode)) {
    const { id, update } = action.payload;
    const entities = updateById(update, id, state.entities);

    return {
      ...state,
      entities,
      results: entities.map(getId)
    };
  }

  if (isType(action, updateLinodeActions.done)) {
    const { result } = action.payload;
    const update = updateOrAdd(result, state.entities);

    return {
      ...state,
      entities: update,
      results: update.map(getId)
    };
  }

  if (isType(action, createLinodeActions.done)) {
    const { result } = action.payload;
    const entities = [...state.entities, result];

    return {
      ...state,
      entities,
      results: entities.map(getId)
    };
  }

  if (isType(action, deleteLinodeActions.done)) {
    const {
      params: { linodeId }
    } = action.payload;
    const entities = state.entities.filter(({ id }) => id !== linodeId);

    return {
      ...state,
      entities,
      results: entities.map(getId)
    };
  }

  if (isType(action, addNotificationsToLinodes)) {
    const { payload: notifications } = action;

    const entities = _addNotificationsToLinodes(notifications, state.entities);

    return {
      ...state,
      entities,
      results: entities.map(getId)
    };
  }

  return state;
};

export default reducer;
