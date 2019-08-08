import { getServices } from 'src/services/managed';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { requestServicesActions } from './managed.actions';

const _getAll = getAll(getServices);

const getAllServices = () => _getAll().then(({ data }) => data);

export const requestManagedServices = createRequestThunk(
  requestServicesActions,
  getAllServices
);
