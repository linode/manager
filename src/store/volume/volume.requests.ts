import { getVolumes } from 'src/services/volumes';
import { getAll } from 'src/utilities/getAll';
import { ThunkActionCreator } from '../types';
import { getAllVolumesActions } from './volume.actions';

const _getAll = getAll<Linode.Volume>(getVolumes);

export const getAllVolumes: ThunkActionCreator<Promise<Linode.Volume[]>> = () => (dispatch) => {
  const { started, done, failed } = getAllVolumesActions;

  dispatch(started());

  return _getAll()
    .then(({ data }) => {
      dispatch(done({ result: data }));
      return data;
    })
    .catch((error) => {
      dispatch(failed({ error }));
      return error;
    });
}



