import { ObjectStorageCluster } from '@linode/api-v4/lib/object-storage/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/clusters/clusters.reducer';
import { requestClusters as _request } from 'src/store/clusters/clusters.actions';
import { Dispatch } from './types';

export interface ObjectStorageClusterProps {
  objectStorageClusters: State;
  requestObjectStorageClusters: () => Promise<ObjectStorageCluster[]>;
}

export const useObjectStorageClusters = () => {
  const dispatch: Dispatch = useDispatch();
  const objectStorageClusters = useSelector(
    (state: ApplicationState) => state.__resources.clusters
  );
  const requestObjectStorageClusters = () => dispatch(_request());

  return { objectStorageClusters, requestObjectStorageClusters };
};

export default useObjectStorageClusters;
