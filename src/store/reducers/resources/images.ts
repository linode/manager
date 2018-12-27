import { Reducer } from "redux";
import { ThunkAction } from "redux-thunk";
import { getImages } from "src/services/images";
import { getAll } from "src/utilities/getAll";
import actionCreatorFactory, { isType } from 'typescript-fsa';



/**
 * State
 */
type State = ApplicationState['__resources']['images'];

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
const actionCreator = actionCreatorFactory(`@@manager/images`);

const getImagesRequest = actionCreator(`request`)

const getImagesSuccess = actionCreator<Linode.Image[]>(`success`)

const getImagesFailure = actionCreator<Linode.ApiFieldError[]>(`fail`)

export const actions = {};



/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {

  if (isType(action, getImagesRequest)) {
    return {
      ...state,
      loading: true,
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
      error: payload,
    };
  }

  return state;
};



/**
 * Async
 */
const requestImages = (): ThunkAction<Promise<Linode.Image[]>, State, undefined> => (dispatch) => {
  const getAllImages = getAll<Linode.Image>(getImages);

  return getAllImages()
    .then(({ data }) => {
      dispatch(getImagesSuccess(data))
      return data;
    })
    .catch((err) => {
      dispatch(getImagesFailure(err))
      return err;
    })
};

export const async = { requestImages };

export default reducer;
