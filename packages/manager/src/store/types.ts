import { Event, Entity as EventEntity } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { QueryClient } from '@tanstack/react-query';
import { MapStateToProps as _MapStateToProps } from 'react-redux';
import { Action, Dispatch } from 'redux';
import { ThunkDispatch as _ThunkDispatch, ThunkAction } from 'redux-thunk';

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
  create?: APIError[];
  delete?: APIError[];
  read?: APIError[];
  update?: APIError[];
}

export type ThunkActionCreator<ReturnType, Params = void> = (
  args: Params,
  ...args2: any[]
) => ThunkResult<ReturnType>;

export type ThunkDispatch = _ThunkDispatch<ApplicationState, undefined, Action>;

export type MapState<S, O> = _MapStateToProps<S, O, ApplicationState>;

export interface HasStringID {
  id: string;
}

export interface HasNumericID {
  id: number;
}

export type Entity = HasNumericID | HasStringID;

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

// NOTE: These 2 interfaces are as of 2/26/2020 what we intend to consolidate around
export interface MappedEntityState2<T extends Entity, E = EntityError> {
  error: E;
  itemsById: Record<string, T>;
  lastUpdated: number;
  loading: boolean;
  results: number;
}

export type RelationalMappedEntityState<T extends Entity, E> = Record<
  number | string,
  MappedEntityState2<T, E>
>;

export interface EntityState<T extends Entity, E = APIError[] | undefined> {
  entities: T[];
  error?: E;
  lastUpdated: number;
  loading: boolean;
  results: TypeOfID<T>[];
}

export interface RequestableData<D, E = APIError[]> {
  data?: D;
  error?: E;
  lastUpdated: number;
  loading: boolean;
}

// Rename to RequestableData and delete above when all components are using this pattern
export interface RequestableDataWithEntityError<D> {
  data?: D;
  error: EntityError;
  lastUpdated: number;
  loading: boolean;
  results?: number;
}

export interface RequestableRequiredData<D> extends RequestableData<D> {
  data: D;
}

export type EventHandler = (
  event: EntityEvent,
  dispatch: Dispatch<any>,
  getState: () => ApplicationState,
  queryClient: QueryClient
) => void;

export interface EntitiesAsObjectState<T> {
  data: Record<string, T>;
  error: EntityError;
  lastUpdated: number;
  loading: boolean;
  results: number;
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
    error: E;
    lastUpdated: number;
    loading: boolean;
  }>
>;
