import { Reducer } from "redux";
import { findAndReplaceOrAppend } from 'src/utilities/findAndReplace';
import { isType } from 'typescript-fsa';

import actions from './volumes.actions';

type State = ApplicationState['__resources']['volumes'];

export const defaultState: State = {
  results: [],
  entities: [],
  loading: true,
  lastUpdated: 0,
  error: undefined,
};

const reducer: Reducer<State> = (state = defaultState, action) => {

  if (isType(action, actions.getVolumesRequest)) {
    return {
      ...state,
      loading: true,
    };
  }

  if (isType(action, actions.getVolumesSuccess)) {
    const { payload } = action;
    return {
      ...state,
      entities: entitiesFromPayload(payload),
      results: resultsFromPayload(payload),
      lastUpdated: Date.now(),
      loading: false,
    };
  }

  if (isType(action, actions.getVolumesFailure)) {

    // This could be an Axios error (network) or API error
    const error = action.payload instanceof Error ?
      [{ reason: 'Network error' }]
      : action.payload;

    return {
      ...state,
      error,
      loading: false,
    };
  }

  if (isType(action, actions.updateVolume)) {
    const { payload } = action;
    const { entities } = state;

    return {
      ...state,
      entities: findAndReplaceOrAppend(entities, payload)
    }
  }

  if (isType(action, actions.updateMultipleVolumes)) {
    const { payload } = action; /** list of successfully updated Volumes */
    return {
      ...state,
      entities: [
        ...state.entities
          .filter(eachEntity => {
            return payload.some(eachVolume => {
              return eachVolume.id === eachEntity.id
            })
          }),
        ...payload
      ]
    }
  }

  if (isType(action, actions.deleteVolume)) {
    const { payload } = action;
    const { entities, results } = state;

    return {
      ...state,
      entities: entities.filter((volume) => volume.id !== payload),
      results: results.filter((id) => id !== payload),
    }
  }

  if (isType(action, actions.addVolume)) {
    const { payload } = action;
    const { entities, results } = state;
    return {
      ...state,
      entities: [...entities, payload],
      results: [...results, payload.id],
    }
  }

  return state
};

export default reducer;

const entitiesFromPayload = (results: Linode.Volume[]) => {
  /** transform as necessary */
  return results.map(i => i);
}

const resultsFromPayload = (results: Linode.Volume[]) => {
  return results.map(v => v.id);
}

export const helpers = { entitiesFromPayload, resultsFromPayload };
