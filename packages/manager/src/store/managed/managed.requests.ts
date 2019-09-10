import {
  createServiceMonitor as _create,
  deleteServiceMonitor as _delete,
  disableServiceMonitor as _disable,
  enableServiceMonitor as _enable,
  getServices,
  ManagedServicePayload,
  updateServiceMonitor as _update
} from 'linode-js-sdk/lib/managed';
import { omit } from 'ramda';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import {
  createServiceMonitorActions,
  deleteServiceMonitorActions,
  disableServiceMonitorActions,
  enableServiceMonitorActions,
  MonitorPayload,
  requestServicesActions,
  updateServiceMonitorActions
} from './managed.actions';

const _getAll = getAll(getServices);

const deleteService = (params: MonitorPayload) => _delete(params.monitorID);
const disableService = (params: MonitorPayload) => _disable(params.monitorID);
const enableService = (params: MonitorPayload) => _enable(params.monitorID);
const updateService = (params: MonitorPayload & ManagedServicePayload) =>
  _update(params.monitorID, omit(['monitorID'], params));

const getAllServices = () => _getAll().then(({ data }) => data);

export const requestManagedServices = createRequestThunk(
  requestServicesActions,
  getAllServices
);

export const disableServiceMonitor = createRequestThunk(
  disableServiceMonitorActions,
  disableService
);

export const createServiceMonitor = createRequestThunk(
  createServiceMonitorActions,
  _create
);

export const updateServiceMonitor = createRequestThunk(
  updateServiceMonitorActions,
  updateService
);

export const deleteServiceMonitor = createRequestThunk(
  deleteServiceMonitorActions,
  deleteService
);

export const enableServiceMonitor = createRequestThunk(
  enableServiceMonitorActions,
  enableService
);
