import { getNotifications, Notification } from 'linode-js-sdk/lib/account';
import { ThunkActionCreator } from '../types';
import {
  handleError,
  handleSuccess,
  startRequest
} from './notification.actions';

export const requestNotifications: ThunkActionCreator<
  Promise<Notification[]>,
  void
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
