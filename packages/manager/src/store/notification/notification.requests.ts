import { getNotifications } from 'src/services/account';
import { ThunkActionCreator } from '../types';
import {
  handleError,
  handleSuccess,
  startRequest
} from './notification.actions';

export const requestNotifications: ThunkActionCreator<
  Promise<Linode.Notification[]>
> = () => dispatch => {
  dispatch(startRequest());
  return getNotifications()
    .then(({ data }) => {
      dispatch(handleSuccess(data));
      return data;
    })
    .catch(error => {
      dispatch(handleError);
      return error;
    });
};
