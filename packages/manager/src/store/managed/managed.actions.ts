import {
  ManagedServiceMonitor,
  ManagedServicePayload,
} from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import actionCreatorFactory from 'typescript-fsa';
import { GetAllData } from 'src/utilities/getAll';

export const actionCreator = actionCreatorFactory(`@@manager/managed`);

export interface MonitorPayload {
  monitorID: number;
}

export const requestServicesActions = actionCreator.async<
  void,
  GetAllData<ManagedServiceMonitor>,
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
