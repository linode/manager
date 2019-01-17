import { getVolumes } from 'src/services/volumes';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { getAllVolumesActions } from './volume.actions';

const _getAll = getAll<Linode.Volume>(getVolumes);

const getAllVolumesRequest = () => _getAll()
  .then(({ data }) => data);

export const getAllVolumes = createRequestThunk(
  getAllVolumesActions,
  getAllVolumesRequest
);