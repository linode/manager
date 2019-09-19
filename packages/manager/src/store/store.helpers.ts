import { assoc, omit } from 'ramda';
import {
  Entity,
  EntityMap,
  MappedEntityState,
  ThunkActionCreator
} from 'src/store/types';
import { AsyncActionCreators } from 'typescript-fsa';

/** ID's are all mapped to string. */
export const mapIDs = (e: { id: number | string }) => String(e.id);
const keys = Object.keys;

export const addEntityRecord = <T extends Entity>(
  result: EntityMap<T>,
  current: T
): EntityMap<T> => assoc(String(current.id), current, result);

export const onStart = <S>(state: S) =>
  Object.assign({}, state, { loading: true, error: undefined });

export const onGetAllSuccess = <E extends Entity, S>(
  items: E[],
  state: S,
  update: (e: E) => E = i => i
): S =>
  Object.assign({}, state, {
    loading: false,
    lastUpdated: Date.now(),
    items: items.map(mapIDs),
    itemsById: items.reduce(
      (itemsById, item) => ({ ...itemsById, [item.id]: update(item) }),
      {}
    )
  });

export const onError = <S = {}, E = Linode.ApiFieldError[] | undefined>(
  error: E,
  state: S
) => Object.assign({}, state, { error, loading: false });

export const createDefaultState = <
  E extends Entity,
  O = Linode.ApiFieldError[] | undefined
>(
  override: Partial<MappedEntityState<E, O>> = {}
): MappedEntityState<E, O> => ({
  itemsById: {},
  items: [],
  loading: true,
  lastUpdated: 0,
  error: undefined,
  ...override
});

export const onDeleteSuccess = <
  E extends Entity,
  O = Linode.ApiFieldError[] | undefined
>(
  id: string | number,
  state: MappedEntityState<E, O>
): MappedEntityState<E, O> => {
  return removeMany([String(id)], state);
};

export const onCreateOrUpdate = <
  E extends Entity,
  O = Linode.ApiFieldError[] | undefined
>(
  entity: E,
  state: MappedEntityState<E, O>
): MappedEntityState<E, O> => {
  return addMany([entity], state);
};

export const removeMany = <
  E extends Entity,
  O = Linode.ApiFieldError[] | undefined
>(
  list: string[],
  state: MappedEntityState<E, O>
): MappedEntityState<E, O> => {
  const itemsById = omit(list, state.itemsById);

  return {
    ...state,
    itemsById,
    items: keys(itemsById)
  };
};

export const addMany = <
  E extends Entity,
  O = Linode.ApiFieldError[] | undefined
>(
  list: E[],
  state: MappedEntityState<E, O>
): MappedEntityState<E, O> => {
  const itemsById = list.reduce(
    (map, item) => ({ ...map, [item.id]: item }),
    state.itemsById
  );

  return {
    ...state,
    itemsById,
    items: keys(itemsById)
  };
};

/**
 * Generates a list of entities added to an existing list, and a list of entities removed from an existing list.
 */
export const getAddRemoved = <E extends Entity>(
  existingList: E[] = [],
  newList: E[] = []
) => {
  const existingIds = existingList.map(({ id }) => String(id));
  const newIds = newList.map(({ id }) => String(id));

  const added = newList.filter(({ id }) => !existingIds.includes(String(id)));

  const removed = existingList.filter(({ id }) => !newIds.includes(String(id)));

  return [added, removed];
};

const createRequestThunk = <Req extends any, Res, Err>(
  actions: AsyncActionCreators<Req, Res, Err>,
  request: (params: Req) => Promise<Res>
): ThunkActionCreator<Promise<Res>, Req> => {
  return (params: Req) => async dispatch => {
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
      return Promise.reject(error);
    }
  };
};

export { createRequestThunk };

export const updateInPlace = <E extends Entity>(
  id: number | string,
  update: (e: E) => E,
  state: MappedEntityState<E>
) => {
  const { itemsById } = state;

  // If this entity cannot be found in state, return the state as-is.
  if (!itemsById[id]) {
    return state;
  }

  // Return the state as-is EXCEPT replacing the original entity with the updated entity.
  const updated = update(itemsById[id]);
  return {
    ...state,
    itemsById: {
      ...itemsById,
      [id]: updated
    }
  };
};
