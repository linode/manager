import { omit } from 'ramda';
import { Entity, EntityState, ThunkActionCreator } from 'src/store/types';
import { AsyncActionCreators } from 'typescript-fsa';

/** ID's are all mapped to string. */
const mapIDs = (e: { id: number | string }) => String(e.id);
const keys = Object.keys;

export const onStart = <S>(state: S) => Object.assign({}, state, { loading: true });

export const onGetAllSuccess = <E extends Entity, S>(
  items: E[],
  state: S,
  update: (e: E) => E = i => i,
): EntityState<E> =>
  Object.assign({}, state, {
    loading: false,
    lastUpdated: Date.now(),
    items: items.map(mapIDs),
    itemsById: items.reduce((itemsById, item) => ({ ...itemsById, [item.id]: update(item) }), {}),
  });

export const onError = <S = {}>(error: Linode.ApiFieldError[], state: S) => Object.assign({}, state, { error });

export const createDefaultState = <E extends Entity>(): EntityState<E> => ({
  itemsById: {},
  items: [],
  loading: true,
  lastUpdated: 0,
  error: undefined,
})

export const onDeleteSuccess = <E extends Entity>(id: string | number, state: EntityState<E>): EntityState<E> => {
  const { itemsById } = state;
  const iid = typeof id === 'number' ? String(id) : id;
  const updated = omit([iid], itemsById);

  return {
    ...state,
    items: keys(updated),
    itemsById: updated,
  }
};

export const onCreateOrUpdate = <E extends Entity>(entity: E, state: EntityState<E>): EntityState<E> => {
  const updated = { ...state.itemsById, [entity.id]: entity };

  return {
    ...state,
    itemsById: updated,
    items: keys(updated),
  };
}


export const createRequestThunk = <Req, Res, Err>(
  actions: AsyncActionCreators<Req, Res, Err>,
  request: (params: Req) => Promise<Res>,
): ThunkActionCreator<any> => (params: Req) => async (dispatch) => {
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
    throw error;
  }
};
