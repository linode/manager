import {
  ManagedServiceMonitor,
  ManagedServicePayload
} from 'linode-js-sdk/lib/managed';
import { APIError } from 'linode-js-sdk/lib/types';
import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/managed`);

export interface MonitorPayload {
  monitorID: number;
}

export const requestServicesActions = actionCreator.async<
  void,
  ManagedServiceMonitor[],
  APIError[]
>('request');

export const disableServiceMonitorActions = actionCreator.async<
  MonitorPayload,
  ManagedServiceMonitor,
  APIError[]
>('disable');

export const createServiceMonitorActions = actionCreator.async<
  ManagedServicePayload,
  ManagedServiceMonitor,
  APIError[]
>('create');

export type UpdateServicePayload = MonitorPayload & ManagedServicePayload;
export const updateServiceMonitorActions = actionCreator.async<
  UpdateServicePayload,
  ManagedServiceMonitor,
  APIError[]
>('update');

export const enableServiceMonitorActions = actionCreator.async<
  MonitorPayload,
  ManagedServiceMonitor,
  APIError[]
>('enable');

export const deleteServiceMonitorActions = actionCreator.async<
  MonitorPayload,
  {},
  APIError[]
>('delete');
