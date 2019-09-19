import { Entity as EventEntity, Event } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import { MapStateToProps as _MapStateToProps } from 'react-redux';
import { Action, Dispatch } from 'redux';
import { ThunkAction, ThunkDispatch as _ThunkDispatch } from 'redux-thunk';
import { ApplicationState } from 'src/store';

interface EntityEvent extends Omit<Event, 'entity'> {
  entity: EventEntity;
}

export type ThunkResult<T> = ThunkAction<
  T,
  ApplicationState,
  undefined,
  Action
>;

export interface EntityError {
  read?: APIError[];
  create?: APIError[];
  delete?: APIError[];
  update?: APIError[];
}

/**
 * the native Redux Action Creator doesn't let us pass typed
 * arguments for the parameters section
 *
 * original ReduxActionCreator:
 *
 * export interface ReduxActionCreator<A> {
 *  (...args: any[]): A;
 * }
 *
 */
export type ParamType<F> = F extends (args: infer A) => any
  ? A extends undefined | null
    ? [any?]
    : [A]
  : [any?];

export type R<A, Params> = (...args: ParamType<(args: Params) => A>) => A;

export type ThunkActionCreator<T, Params = undefined> = R<
  ThunkResult<T>,
  Params
>;

export type ThunkDispatch = _ThunkDispatch<ApplicationState, undefined, Action>;

export type MapState<S, O> = _MapStateToProps<S, O, ApplicationState>;

export interface HasStringID {
  id: string;
}

export interface HasNumericID {
  id: number;
}

export type Entity = HasStringID | HasNumericID;

export type TypeOfID<T> = T extends HasNumericID ? number : string;

export type EntityMap<T> = Record<string, T>;

export interface MappedEntityState<
  T extends Entity,
  E = APIError[] | undefined
> {
  error?: E;
  items: string[];
  itemsById: EntityMap<T>;
  lastUpdated: number;
  loading: boolean;
}

export interface EntityState<T extends Entity, E = APIError[] | undefined> {
  results: TypeOfID<T>[];
  entities: T[];
  loading: boolean;
  lastUpdated: number;
  error?: E;
}

export interface RequestableData<D, E = APIError[]> {
  lastUpdated: number;
  loading: boolean;
  data?: D;
  error?: E;
}

// Rename to RequestableData and delete above when all components are using this pattern
export interface RequestableDataWithEntityError<D> {
  lastUpdated: number;
  loading: boolean;
  data?: D;
  results?: number;
  error: EntityError;
}

export interface RequestableRequiredData<D> extends RequestableData<D> {
  data: D;
}

export type EventHandler = (
  event: EntityEvent,
  dispatch: Dispatch<any>,
  getState: () => ApplicationState
) => void;

export interface EntitiesAsObjectState<T> {
  error?: Partial<{
    read: APIError[];
    create: APIError[];
    delete: APIError[];
    update: APIError[];
  }>;
  data: Record<string, T>;
  results: number;
  lastUpdated: number;
  loading: boolean;
  listOfIDsInOriginalOrder: (string | number)[];
}
