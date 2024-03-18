// @todo rename this file to store.helpers when all reducers are using MappedEntityState2
import { APIError } from '@linode/api-v4/lib/types';
import { assoc, omit } from 'ramda';
import { AsyncActionCreators } from 'typescript-fsa';

import {
  Entity,
  EntityError,
  EntityMap,
  MappedEntityState2 as MappedEntityState,
  ThunkActionCreator,
} from 'src/store/types';

export const addEntityRecord = <T extends Entity>(
  result: EntityMap<T>,
  current: T
): EntityMap<T> => assoc(String(current.id), current, result);

export const onStart = <S>(state: S) =>
  Object.assign({}, state, { error: { read: undefined }, loading: true });

export const onGetAllSuccess = <E extends Entity, S>(
  items: E[],
  state: S,
  results: number,
  update: (e: E) => E = (i) => i
): S =>
  Object.assign({}, state, {
    itemsById: items.reduce(
      (itemsById, item) => ({ ...itemsById, [item.id]: update(item) }),
      {}
    ),
    lastUpdated: Date.now(),
    loading: false,
    results,
  });

export const setError = <E extends Entity>(
  error: EntityError,
  state: MappedEntityState<E, EntityError>
) => {
  return Object.assign({}, state, { error: { ...state.error, ...error } });
};

export const onError = <S = {}, E = APIError[] | undefined>(
  error: E,
  state: S
) => Object.assign({}, state, { error, loading: false });

export const createDefaultState = <E extends Entity, O extends EntityError>(
  override: Partial<MappedEntityState<E, O>> = {},
  defaultError: O = {} as O
): MappedEntityState<E, O> => ({
  error: defaultError as O, // @todo decide on better approach to error typing
  itemsById: {},
  lastUpdated: 0,
  loading: false,
  results: 0,
  ...override,
});

export const onDeleteSuccess = <E extends Entity, O = APIError[] | undefined>(
  id: number | string,
  state: MappedEntityState<E, O>
): MappedEntityState<E, O> => {
  return removeMany([String(id)], state);
};

export const onCreateOrUpdate = <E extends Entity, O = APIError[] | undefined>(
  entity: E,
  state: MappedEntityState<E, O>
): MappedEntityState<E, O> => {
  return addMany([entity], state);
};

export const removeMany = <E extends Entity, O = APIError[] | undefined>(
  list: string[],
  state: MappedEntityState<E, O>
): MappedEntityState<E, O> => {
  const itemsById = omit(list, state.itemsById);

  return {
    ...state,
    itemsById,
    results: Object.keys(itemsById).length,
  };
};

export const addMany = <E extends Entity, O = APIError[] | undefined>(
  list: E[],
  state: MappedEntityState<E, O>,
  results?: number
): MappedEntityState<E, O> => {
  const itemsById = list.reduce(
    (map, item) => ({ ...map, [item.id]: item }),
    state.itemsById
  );

  return {
    ...state,
    itemsById,
    results: results ?? Object.keys(itemsById).length,
  };
};

export const onGetPageSuccess = <E extends Entity>(
  items: E[],
  state: MappedEntityState<E, EntityError>,
  results: number
): MappedEntityState<E, EntityError> => {
  const isFullRequest = results === items.length;
  const newState = addMany(items, state, results);
  return isFullRequest
    ? {
        ...newState,
        lastUpdated: Date.now(),
        loading: false,
      }
    : { ...newState, loading: false };
};

export const createRequestThunk = <Req extends any, Res extends any, Err>(
  actions: AsyncActionCreators<Req, Res, Err>,
  request: (params: Req) => Promise<any>
): ThunkActionCreator<Promise<Res>, Req> => {
  return (params: Req) => async (dispatch) => {
    const { done, failed, started } = actions;

    dispatch(started(params));

    try {
      const result = await request(params);
      const doneAction = done({ params, result });
      dispatch(doneAction);
      return result;
    } catch (error) {
      const failAction = failed({ error, params });
      dispatch(failAction);
      return Promise.reject(error);
    }
  };
};
