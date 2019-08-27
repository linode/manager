import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/managed`);

import { ManagedServicePayload } from 'src/services/managed';

export interface MonitorPayload {
  monitorID: number;
}

export const requestServicesActions = actionCreator.async<
  void,
  Linode.ManagedServiceMonitor[],
  Linode.ApiFieldError[]
>('request');

export const disableServiceMonitorActions = actionCreator.async<
  MonitorPayload,
  Linode.ManagedServiceMonitor,
  Linode.ApiFieldError[]
>('disable');

export const createServiceMonitorActions = actionCreator.async<
  ManagedServicePayload,
  Linode.ManagedServiceMonitor,
  Linode.ApiFieldError[]
>('create');

export const enableServiceMonitorActions = actionCreator.async<
  MonitorPayload,
  Linode.ManagedServiceMonitor,
  Linode.ApiFieldError[]
>('enable');

export const deleteServiceMonitorActions = actionCreator.async<
  MonitorPayload,
  {},
  Linode.ApiFieldError[]
>('delete');
