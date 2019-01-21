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
  return removeMany([String(id)], state);
};

export const onCreateOrUpdate = <E extends Entity>(entity: E, state: MappedEntityState<E>): MappedEntityState<E> => {
  return addMany([entity], state);
}

export const removeMany = <E extends Entity>(list: string[], state: MappedEntityState<E>): MappedEntityState<E> => {
  const itemsById = omit(list, state.itemsById);

  return {
    ...state,
    itemsById,
    items: keys(itemsById),
  }
};

export const addMany = <E extends Entity>(list: E[], state: MappedEntityState<E>): MappedEntityState<E> => {
  const itemsById = list.reduce((map, item) => ({ ...map, [item.id]: item }), state.itemsById)

  return {
    ...state,
    itemsById,
    items: keys(itemsById),
  }
};


export const getAddRemoved = <E extends Entity>(existingList: E[] = [], newList: E[] = []) => {
  const existingIds = existingList.map(({ id }) => String(id))
  const newIds = newList.map(({ id }) => String(id))

  const added = newList
    .filter(({ id }) => !existingIds.includes(String(id)));

  const removed = existingList
    .filter(({ id }) => !newIds.includes(String(id)));

  return [added, removed];
}

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
