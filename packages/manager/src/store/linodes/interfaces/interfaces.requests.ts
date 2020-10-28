import {
  LinodeInterface,
  createInterface as _createInterface,
  deleteInterface as _deleteInterface,
  getInterface as _getInterface,
  getInterfaces as _getInterfaces
} from '@linode/api-v4/lib/linodes';
import { createRequestThunk } from 'src/store/store.helpers';
import { getAllWithArguments } from 'src/utilities/getAll';
import {
  getAllLinodeInterfacesActions,
  getLinodeInterfaceActions,
  createLinodeInterfaceActions,
  deleteLinodeInterfaceActions
} from './interfaces.actions';

export const createLinodeInterface = createRequestThunk(
  createLinodeInterfaceActions,
  ({ linodeId, ...data }) => _createInterface(linodeId, data)
);

export const requestAll = (payload: {
  linodeId: number;
  params?: any;
  filter?: any;
}) =>
  getAllWithArguments<LinodeInterface>(_getInterfaces)(
    [payload.linodeId],
    payload.params,
    payload.filter
  );

export const getAllLinodeInterfaces = createRequestThunk(
  getAllLinodeInterfacesActions,
  requestAll
);

export const getLinodeInterface = createRequestThunk(
  getLinodeInterfaceActions,
  ({ linodeId, interfaceId }) => _getInterface(linodeId, interfaceId)
);

export const deleteLinodeInterface = createRequestThunk(
  deleteLinodeInterfaceActions,
  ({ linodeId, interfaceId }) => _deleteInterface(linodeId, interfaceId)
);
