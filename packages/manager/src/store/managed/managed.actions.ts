import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/managed`);

export const requestServicesActions = actionCreator.async<
  void,
  Linode.ManagedServiceMonitor[],
  Linode.ApiFieldError[]
>('request');
