import { getServices } from 'src/services/managed';
import { getAll } from 'src/utilities/getAll';
import { ThunkActionCreator } from '../types';
import { requestServicesActions } from './managed.actions';

const getAllServices = () =>
  getAll<Linode.ManagedServiceMonitor>(() => getServices());

export const requestManagedServices: ThunkActionCreator<
  Promise<Linode.KubeNodePoolResponse[]>
> = () => dispatch => {
  dispatch(requestServicesActions.started());

  return getAllServices()()
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
