import { adjust } from 'ramda';
import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import updateOrAdd from "src/utilities/updateOrAdd";
import { AsyncActionCreators } from 'typescript-fsa';

interface State<T extends { id: number }> {
  entities: T[];
  error?: Linode.ApiFieldError[];
  lastUpdated: number;
  loading: boolean;
  results: number[];
}

export const onStart = <S>(state: S) => Object.assign({}, state, { loading: true });

export const onGetAllSuccess = <T extends { id: number }, S>(items: T[], state: S) =>
  Object.assign({}, state, {
    loading: false,
    lastUpdated: Date.now(),
    entities: items,
    results: items.map(e => e.id),
  });

export const onError = <S = {}>(error: Linode.ApiFieldError[], state: S) => Object.assign({}, state, { error });

export const createDefaultState = <E extends { id: number }>(): State<E> => ({
  results: [],
  entities: [],
  loading: true,
  lastUpdated: 0,
  error: undefined,
})

export const onDeleteSuccess = <E extends { id: number }>(id: number, state: State<E>): State<E> => {
  const { entities } = state;
  const updated = entities.filter(e => e.id !== id);

  return {
    ...state,
    entities: updated,
    results: updated.map(e => e.id),
  }
};

export const onCreateSuccess = <E extends { id: number }>(entity: E, state: State<E>): State<E> => {
  const updated = [...state.entities, entity];

  return {
    ...state,
    entities: updated,
    results: updated.map((e) => e.id),
  };
}

export const onUpdateSuccess = <E extends { id: number }>(entity: E, state: State<E>): State<E> => {
  const updated = updateOrAdd(entity, state.entities);

  return {
    ...state,
    entities: updated,
    results: updated.map((e) => e.id),
  }
};

export const updateInPlace = <E extends { id: number }>(id: number, update: (v: E) => E, state: State<E>): State<E> => {
  const { entities, results } = state;
  if (results.length === 0) {
    return state;
  }

  const foundId = results.findIndex(i => i === id);
  if (foundId < 0) {
    return state;
  }

  const updated = adjust(update, foundId, entities);
  return {
    ...state,
    entities: updated,
    results: updated.map((e) => e.id),
  }
};

type ThunkResult<R> = ThunkAction<R, ApplicationState, undefined>;

export const createRequestThunk = <Req, Res, Err>(
  actions: AsyncActionCreators<Req, Res, Err>,
  request: (params: Req) => Promise<Res>,
): ActionCreator<ThunkResult<any>> => (params: Req) => async (dispatch, getState) => {
  const { started, done, failed } = actions;

  started(params);

  try {
    const result = await request(params);
    const doneAction = done({ result, params });

    dispatch(doneAction);
    return result;
  } catch (error) {
    const failAction = failed({ error, params });

    dispatch(failAction);
    return error;
  }
};
