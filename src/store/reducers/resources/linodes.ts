import * as Bluebird from 'bluebird';
import { Dispatch, Reducer } from "redux";
import { ThunkAction } from 'redux-thunk';
import requestMostRecentBackupForLinode from 'src/features/linodes/LinodesLanding/requestMostRecentBackupForLinode';
import { getLinode, getLinodes } from "src/services/linodes";
import { findAndReplaceOrAppend } from 'src/utilities/findAndReplace';
import { getAll } from "src/utilities/getAll";
import actionCreatorFactory, { isType } from 'typescript-fsa';

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
 * Actions
 */
export const actionCreator = actionCreatorFactory(`@@manager/linodes`);

const getLinodesRequest = actionCreator('request');

const getLinodesSuccess = actionCreator<Linode.Linode[]>('success');

const getLinodesFailure = actionCreator<Linode.ApiFieldError[]>('fail');

const addLinode = actionCreator<Linode.Linode>('add');

export const updateLinode = actionCreator<Linode.Linode>('update');

export const updateMultipleLinodes = actionCreator<Linode.Linode[]>('update_multiple')

const deleteLinode = actionCreator<number>('delete');

export const actions = { addLinode, updateLinode, deleteLinode, };

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {

  if (isType(action, getLinodesRequest)) {
    return {
      ...state,
      loading: true,
    };
  }

  if (isType(action, getLinodesSuccess)) {
    const { payload } = action;
    return {
      ...state,
      entities: entitiesFromPayload(payload),
      results: resultsFromPayload(payload),
      lastUpdated: Date.now(),
      loading: false,
    };
  }

  if (isType(action, getLinodesFailure)) {

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

  if (isType(action, updateLinode)) {
    const { payload } = action;
    const { entities } = state;

    return {
      ...state,
      entities: findAndReplaceOrAppend(entities, payload)
    }
  }

  if (isType(action, updateMultipleLinodes)) {
    const { payload } = action; /** list of successfully updated Linodes */
    return {
      ...state,
      entities: [
        ...state.entities
          .filter(eachEntity => {
            return payload.some(eachLinode => {
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

  if (isType(action, addLinode)) {
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



/**
 * Async
 */
const requestLinodes = () => (dispatch: Dispatch<State>) => {
  dispatch(getLinodesRequest());

  return getAll<Linode.Linode>(getLinodes)()
    .then(getBackupsForLinodes)
    .then((linodes) => {
      dispatch(getLinodesSuccess(linodes));
      return linodes;
    })
    .catch((err) => {
      dispatch(getLinodesFailure(err));
    });
};

const getBackupsForLinodes = ({ data }: { data: Linode.Linode[] }) => Bluebird.map(data, requestMostRecentBackupForLinode);

type RequestLinodeForStoreThunk = (id: number) => ThunkAction<void, ApplicationState, undefined>;
const requestLinodeForStore: RequestLinodeForStoreThunk = (id) => (dispatch, getState) => {
  const { results } = getState().__resources.linodes;

  getLinode(id)
    .then(response => response.data)
    .then(requestMostRecentBackupForLinode)
    .then(linode => {
      if (results.includes(id)) {
        return dispatch(updateLinode(linode));
      }
      return dispatch(addLinode(linode))
    })

};

export const async = { requestLinodes, requestLinodeForStore }



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
