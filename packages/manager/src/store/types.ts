import type { MapStateToProps as _MapStateToProps } from 'react-redux';

import type { Event, Entity as EventEntity } from '@linode/api-v4/lib/account';
import type { APIError } from '@linode/api-v4/lib/types';
import type { QueryClient } from '@tanstack/react-query';
import type { Action, Dispatch } from 'redux';
import type { ThunkDispatch as _ThunkDispatch, ThunkAction } from 'redux-thunk';
import type { ApplicationState } from 'src/store';

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
  number | string,
  Partial<{
    data: T;
    error: E;
    lastUpdated: number;
    loading: boolean;
  }>
>;
