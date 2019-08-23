import {
  createServiceMonitor as _create,
  deleteServiceMonitor as _delete,
  disableServiceMonitor as _disable,
  enableServiceMonitor as _enable,
  getServices
} from 'src/services/managed';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import {
  createServiceMonitorActions,
  deleteServiceMonitorActions,
  disableServiceMonitorActions,
  enableServiceMonitorActions,
  MonitorPayload,
  requestServicesActions
} from './managed.actions';

const _getAll = getAll(getServices);

const deleteService = (params: MonitorPayload) => _delete(params.monitorID);
const disableService = (params: MonitorPayload) => _disable(params.monitorID);
const enableService = (params: MonitorPayload) => _enable(params.monitorID);

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

export const deleteServiceMonitor = createRequestThunk(
  deleteServiceMonitorActions,
  deleteService
);

export const enableServiceMonitor = createRequestThunk(
  enableServiceMonitorActions,
  enableService
);
