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

export type ThunkActionCreator<ReturnType, Params = void> = (
  args: Params
) => ThunkResult<ReturnType>;

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

export type CRUDError = Partial<{
  read: APIError[];
  create: APIError[];
  delete: APIError[];
  update: APIError[];
}>;

export interface EntitiesAsObjectState<T> {
  error: Partial<EntityError>;
  data: Record<string, T>;
  results: number;
  lastUpdated: number;
  loading: boolean;
  listOfIDsInOriginalOrder: (string | number)[];
}

/**
 * This is meant to be specifically for data sets that relate to some parent
 * data set.
 *
 * Think NodeBalancer configs - the key here will be the NodeBalancer ID
 * and the data contains the meta data for the NodeBalancer Config
 *
 * Or for Longview Client Stats - the key is the Longview Client
 * and the data is the actual stats for the Client
 */
export type RelationalDataSet<T extends {}, E = EntityError> = Record<
  string,
  Partial<{
    data: T;
    loading: boolean;
    error: E;
    lastUpdated: number;
  }>
>;
