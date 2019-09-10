import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/managed`);

import { ManagedServicePayload } from 'linode-js-sdk/lib/managed';
import { ManagedServiceMonitor } from 'linode-js-sdk/lib/managed/types';

export interface MonitorPayload {
  monitorID: number;
}

export const requestServicesActions = actionCreator.async<
  void,
  ManagedServiceMonitor[],
  Linode.ApiFieldError[]
>('request');

export const disableServiceMonitorActions = actionCreator.async<
  MonitorPayload,
  ManagedServiceMonitor,
  Linode.ApiFieldError[]
>('disable');

export const createServiceMonitorActions = actionCreator.async<
  ManagedServicePayload,
  ManagedServiceMonitor,
  Linode.ApiFieldError[]
>('create');

export type UpdateServicePayload = MonitorPayload & ManagedServicePayload;
export const updateServiceMonitorActions = actionCreator.async<
  UpdateServicePayload,
  ManagedServiceMonitor,
  Linode.ApiFieldError[]
>('update');

export const enableServiceMonitorActions = actionCreator.async<
  MonitorPayload,
  ManagedServiceMonitor,
  Linode.ApiFieldError[]
>('enable');

export const deleteServiceMonitorActions = actionCreator.async<
  MonitorPayload,
  {},
  Linode.ApiFieldError[]
>('delete');
