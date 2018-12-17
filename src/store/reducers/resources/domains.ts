import { Dispatch, Reducer } from "redux";
import { ThunkAction } from 'redux-thunk';
import { getDomain, getDomains } from "src/services/domains";
import { getAll } from "src/utilities/getAll";
import actionCreatorFactory, { isType } from 'typescript-fsa';

/**
 * State
 */
type State = ApplicationState['__resources']['domains'];

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
export const actionCreator = actionCreatorFactory(`@@manager/domains`);

const getDomainsRequest = actionCreator('request');

const getDomainsSuccess = actionCreator<Linode.Domain[]>('success');

const getDomainsFailure = actionCreator<Linode.ApiFieldError[]>('fail');

const addDomain = actionCreator<Linode.Domain>('add');

const updateDomain = actionCreator<Linode.Domain>('update');

const deleteDomain = actionCreator<number>('delete');

export const actions = { addDomain, updateDomain, deleteDomain, };

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, getDomainsRequest)) {
    return {
      ...state,
      loading: true,
    };
  }

  if (isType(action, getDomainsSuccess)) {
    const { payload } = action;
    return {
      ...state,
      entities: entitiesFromPayload(payload),
      results: resultsFromPayload(payload),
      lastUpdate: Date.now(),
      loading: false,
    };
  }

  if (isType(action, getDomainsFailure)) {
    return {
      ...state,
      error: action.payload,
      loading: false,
    };
  }

  if (isType(action, updateDomain)) {
    const { payload } = action;
    return {
      ...state,
      entities: state.entities.map((domain) => domain.id === payload.id ? payload : domain),
    }
  }

  if (isType(action, deleteDomain)) {
    const { payload } = action;
    const { entities, results } = state;

    return {
      ...state,
      entities: entities.filter((domain) => domain.id !== payload),
      results: results.filter((id) => id !== payload),
    }
  }

  if (isType(action, addDomain)) {
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
const requestDomains = () => (dispatch: Dispatch<State>) => {

  dispatch(getDomainsRequest());

  return getAll<Linode.Domain>(getDomains)()
    .then((domains) => {
      dispatch(getDomainsSuccess(domains.data));
      return domains;
    })
    .catch((err) => {
      dispatch(getDomainsFailure(err));
    });
};

type RequestDomainForStoreThunk = (id: number) => ThunkAction<void, ApplicationState, undefined>;
const requestDomainForStore: RequestDomainForStoreThunk = (id) => (dispatch, getState) => {
  const { results } = getState().__resources.domains;

  getDomain(id)
    .then(response => response)
    .then(domain => {
      if (results.includes(id)) {
        return dispatch(updateDomain(domain));
      }
      return dispatch(addDomain(domain))
    })

};

export const async = { requestDomains, requestDomainForStore }

/**
 * Helpers
 */
const entitiesFromPayload = (domains: Linode.Domain[]) => {
  /** transform as necessary */
  return domains.map(i => i);
}

const resultsFromPayload = (domains: Linode.Domain[]) => {
  return domains.map(l => l.id);
}

export const helpers = {};
