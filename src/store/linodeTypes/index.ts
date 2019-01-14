import { Reducer } from "redux";
import { getDeprecatedLinodeTypes, getLinodeTypes } from "src/services/linodes";
import { ThunkActionCreator } from "src/store/types";
import { getAll } from "src/utilities/getAll";
import actionCreatorFactory, { isType } from 'typescript-fsa';



/**
 * State
 */
type State = ApplicationState['__resources']['types'];

export const defaultState: State = {
  entities: [],
  results: [],
  error: undefined,
  loading: true,
  lastUpdated: 0,
};



/**
 * Actions
 */
const actionCreator = actionCreatorFactory(`@@manager/types`);

const getTypesRequest = actionCreator(`request`)

const getTypesSuccess = actionCreator<Linode.LinodeType[]>(`success`)

const getTypesFailure = actionCreator<Linode.ApiFieldError[]>(`fail`)

export const actions = {};



/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {

  if (isType(action, getTypesRequest)) {
    return {
      ...state,
      loading: true,
    };
  }

  if (isType(action, getTypesSuccess)) {
    const { payload } = action;

    return {
      ...state,
      loading: false,
      lastUpdated: Date.now(),
      entities: payload,
      results: payload.map(t => t.id)
    };
  }

  if (isType(action, getTypesFailure)) {
    const { payload } = action;

    return {
      ...state,
      loading: false,
      error: payload,
    };
  }

  return state;
};



/**
 * Async
 */
type RequesTypesThunk= ThunkActionCreator<Promise<Linode.LinodeType[]>>;
const requestTypes: RequesTypesThunk = () => (dispatch) => {
  return Promise.all([
    getAll<Linode.LinodeType>(getLinodeTypes)(),
    getAll<Linode.LinodeType>(getDeprecatedLinodeTypes)(),
  ])
    .then(([{ data: types }, { data: legacyTypes }]) => [...types, ...legacyTypes])
    .then((allTypes) => {
      dispatch(getTypesSuccess(allTypes))
      return allTypes;
    })
    .catch((err) => {
      dispatch(getTypesFailure(err))
      return err;
    })
};

export const async = { requestTypes };

export default reducer;
