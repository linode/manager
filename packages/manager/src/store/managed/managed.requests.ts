import { getServices } from 'src/services/managed';
import { getAll } from 'src/utilities/getAll';
import { ThunkActionCreator } from '../types';
import { requestServicesActions } from './managed.actions';

const getAllServices = (clusterID: number) =>
  getAll<Linode.ManagedServiceMonitor>(() => getServices(clusterID));

export const requestManagedServices: ThunkActionCreator<
  Promise<Linode.KubeNodePoolResponse[]>
> = ({ clusterID }) => dispatch => {
  dispatch(requestServicesActions.started());

  return getAllServices(clusterID)()
    .then(services => {
      return dispatch(
        requestServicesActions.done({
          result: services.data
        })
      );
    })
    .catch(error => {
      dispatch(requestServicesActions.failed({ error }));
      return error;
    });
};
