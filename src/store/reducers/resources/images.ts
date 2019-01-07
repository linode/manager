import { pathOr } from 'ramda';
import { Reducer } from "redux";
import { ThunkAction } from "redux-thunk";
import { getImages } from "src/services/images";
import { getAll } from "src/utilities/getAll";
import updateOrAdd from 'src/utilities/updateOrAdd';
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

const removeImage = actionCreator<number | string>(`remove`);

const addOrUpdateImage = actionCreator<Linode.Image>('add_or_update');

export const actions = { removeImage, addOrUpdateImage };



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

  if (isType(action, removeImage)) {
    const { payload } = action;
    /**
     * Events provide a numeric ID, but the actual ID is a string. So we have to respond
     * to both potentials.
     * ![Hard to work](https://media.giphy.com/media/juSraIEmIN5eg/giphy.gif)
     */
    const id = typeof payload === 'string' ? payload : `private/${payload}`
    const updated = state.entities.filter((image) => image.id !== id);

    return {
      ...state,
      entities: updated,
      results: updated.map((i) => i.id),
    };
  }

  if (isType(action, addOrUpdateImage)) {
    const { payload } = action;
    const updated = updateOrAdd(payload, state.entities);
    return {
      ...state,
      entities: updated,
      results: updated.map((i) => i.id),
    }
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
      const ApiError = pathOr(
        [{ reason: "There was an error retrieving your Images." }],
        ['response', 'data', 'errors'],
        err
      )
      dispatch(getImagesFailure(ApiError))
      return err;
    })
};

export const async = { requestImages };

export default reducer;
