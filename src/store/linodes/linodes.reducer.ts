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
  getInitialLinodesActions,
  getLinodesActions,
  setLinodeMetadata,
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
export interface State extends EntityState<LinodeWithMaintenance, EntityError> {
  initialLoad: boolean;
  linodeCount: number;
}

export const defaultState: State = {
  results: [],
  entities: [],
  loading: true,
  lastUpdated: 0,
  initialLoad: false,
  linodeCount: 0,
  error: undefined
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  /** Initial request (get the first page) */
  if (isType(action, getInitialLinodesActions.started)) {
    return {
      ...state,
      loading: true
    };
  }

  if (isType(action, getInitialLinodesActions.done)) {
    const {
      payload: { result }
    } = action;
    return {
      ...state,
      entities: result,
      results: result.map(getId),
      lastUpdated: Date.now(),
      initialLoad: true,
      loading: false
    };
  }

  if (isType(action, getInitialLinodesActions.failed)) {
    const { error } = action.payload;

    return {
      ...state,
      error: {
        read: error
      },
      loading: false
    };
  }

  /** Get ALL */
  if (isType(action, getLinodesActions.started)) {
    if (state.initialLoad) {
      // Don't set loading; we want this to run in the background.
      return state;
    }
    return {
      ...state,
      loading: true
    };
  }

  if (isType(action, getLinodesActions.done)) {
    const {
      payload: { result }
    } = action;

    if (state.initialLoad) {
      // We want to append here
      return {
        ...state,
        entities: [...state.entities, ...result],
        results: result.map(getId),
        lastUpdated: Date.now(),
        loading: false,
        /**
         * If this action gets called again, we
         * want to get everything rather than
         * have a stale first page.
         */
        initialLoad: false
      };
    }
    return {
      ...state,
      entities: result,
      results: result.map(getId),
      lastUpdated: Date.now(),
      loading: false,
      /**
       * If this action gets called again, we
       * want to get everything rather than
       * have a stale first page.
       */
      initialLoad: false
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

  if (isType(action, setLinodeMetadata)) {
    const { linodeCount } = action.payload;

    return {
      ...state,
      linodeCount
    };
  }

  return state;
};

export default reducer;
