import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/managed`);

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
