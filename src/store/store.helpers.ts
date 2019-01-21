import { omit } from 'ramda';
import { Entity, MappedEntityState, ThunkActionCreator } from 'src/store/types';
import { AsyncActionCreators } from 'typescript-fsa';

/** ID's are all mapped to string. */
const mapIDs = (e: { id: number | string }) => String(e.id);
const keys = Object.keys;

export const onStart = <S>(state: S) => Object.assign({}, state, { loading: true });

export const onGetAllSuccess = <E extends Entity, S>(
  items: E[],
  state: S,
  update: (e: E) => E = i => i,
): MappedEntityState<E> =>
  Object.assign({}, state, {
    loading: false,
    lastUpdated: Date.now(),
    items: items.map(mapIDs),
    itemsById: items.reduce((itemsById, item) => ({ ...itemsById, [item.id]: update(item) }), {}),
  });

export const onError = <S = {}>(error: Linode.ApiFieldError[], state: S) => Object.assign({}, state, { error });

export const createDefaultState = <E extends Entity>(override: Partial<MappedEntityState<E>> = {}): MappedEntityState<E> => ({
  itemsById: {},
  items: [],
  loading: true,
  lastUpdated: 0,
  error: undefined,
  ...override,
})

export const onDeleteSuccess = <E extends Entity>(id: string | number, state: MappedEntityState<E>): MappedEntityState<E> => {
  const { itemsById } = state;
  const iid = typeof id === 'number' ? String(id) : id;
  const updated = omit([iid], itemsById);

  return {
    ...state,
    items: keys(updated),
    itemsById: updated,
  }
};

export const onCreateOrUpdate = <E extends Entity>(entity: E, state: MappedEntityState<E>): MappedEntityState<E> => {
  const updated = { ...state.itemsById, [entity.id]: entity };

  return {
    ...state,
    itemsById: updated,
    items: keys(updated),
  };
}

export const removeMany = <E extends Entity>(list: string[], state: MappedEntityState<E>): MappedEntityState<E> => {
  const itemsById = omit(list, state.itemsById);

  return {
    ...state,
    itemsById,
    items: Object.keys(itemsById),
  }
};


export const createRequestThunk = <Req, Res, Err>(
  actions: AsyncActionCreators<Req, Res, Err>,
  request: (params: Req) => Promise<Res>,
): ThunkActionCreator<Promise<Res>> => (params: Req) => async (dispatch) => {
  const { started, done, failed } = actions;

  dispatch(started(params));

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
