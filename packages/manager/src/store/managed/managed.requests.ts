import {
  createServiceMonitor as _create,
  disableServiceMonitor as _disable,
  getServices
} from 'src/services/managed';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import {
  createServiceMonitorActions,
  disableServiceMonitorActions,
  MonitorPayload,
  requestServicesActions
} from './managed.actions';

const _getAll = getAll(getServices);
const disableService = (params: MonitorPayload) => _disable(params.monitorID);

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
