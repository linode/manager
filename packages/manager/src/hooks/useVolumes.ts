import { Volume } from '@linode/api-v4/lib/volumes/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/volume/volume.reducer';
import { getAllVolumes } from 'src/store/volume/volume.requests';
import { Dispatch } from './types';

export interface VolumesProps {
  volumes: State;
  requestVolumes: () => Promise<Volume[]>;
}

export const useVolumes = () => {
  const dispatch: Dispatch = useDispatch();
  const volumes = useSelector(
    (state: ApplicationState) => state.__resources.volumes
  );
  const requestVolumes = () => dispatch(getAllVolumes());

  return { volumes, requestVolumes };
};

export default useVolumes;
