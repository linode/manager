import { Reducer } from "redux";
import updateById from 'src/utilities/updateById';
import updateOrAdd from 'src/utilities/updateOrAdd';
import { isType } from 'typescript-fsa';
import { deleteLinode, linodesRequest, updateLinode, updateMultipleLinodes, upsertLinode } from './linodes.actions';

/**
 * State
 */
type State = ApplicationState['__resources']['linodes'];

export const defaultState: State = {
  results: [],
  entities: [],
  loading: true,
  lastUpdated: 0,
  error: undefined,
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, linodesRequest.started)) {
    return {
      ...state,
      loading: true,
    };
  }

  if (isType(action, linodesRequest.done)) {
    const { payload: { result } } = action;
    return {
      ...state,
      entities: entitiesFromPayload(result),
      results: resultsFromPayload(result),
      lastUpdated: Date.now(),
      loading: false,
    };
  }

  if (isType(action, linodesRequest.failed)) {
    const { error } = action.payload;

    return {
      ...state,
      error,
      loading: false,
    };
  }

  if (isType(action, upsertLinode)) {
    const { payload } = action;
    const { entities } = state;

    return {
      ...state,
      entities: updateOrAdd(payload, entities)
    }
  }

  if (isType(action, updateMultipleLinodes)) {
    const { payload } = action; /** list of successfully updated Linodes */
    return {
      ...state,
      entities: [
        ...state.entities
          .filter(eachEntity => {
            return !payload.some(eachLinode => {
              return eachLinode.id === eachEntity.id
            })
          }),
        ...payload
      ]
    }
  }

  if (isType(action, deleteLinode)) {
    const { payload } = action;
    const { entities, results } = state;

    return {
      ...state,
      entities: entities.filter((linode) => linode.id !== payload),
      results: results.filter((id) => id !== payload),
    }
  }

  if (isType(action, updateLinode)) {
    const { id, update } = action.payload;
    const { entities } = state;

    const updated = updateById(update, id, entities);

    return {
      ...state,
      entities: updated,
      results: updated.map((l) => l.id),
    }
  }

  return state
};

export default reducer;

/**
 * Helpers
 */
const entitiesFromPayload = (linodes: Linode.Linode[]) => {
  /** transform as necessary */
  return linodes.map(i => i);
}

const resultsFromPayload = (linodes: Linode.Linode[]) => {
  return linodes.map(l => l.id);
}

export const helpers = {};
