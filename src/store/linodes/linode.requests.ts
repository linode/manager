import {
  createLinode as _createLinode,
  deleteLinode as _deleteLinode,
  updateLinode as _updateLinode
} from 'src/services/linodes';
import { createRequestThunk } from '../store.helpers';
import {
  createLinodeActions,
  deleteLinodeActions,
  updateLinodeActions
} from './linodes.actions';

export const updateLinode = createRequestThunk(
  updateLinodeActions,
  ({ linodeId, ...data }) => _updateLinode(linodeId, data)
);

export const createLinode = createRequestThunk(createLinodeActions, data =>
  _createLinode(data)
);

export const deleteLinode = createRequestThunk(
  deleteLinodeActions,
  ({ linodeId }) => _deleteLinode(linodeId)
);
