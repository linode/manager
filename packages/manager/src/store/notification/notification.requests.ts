import { Notification } from '@linode/api-v4/lib/account/types';
import { getNotifications } from '@linode/api-v4/lib/account/events';
import { ThunkActionCreator } from '../types';
import {
  handleError,
  handleSuccess,
  startRequest,
} from './notification.actions';
import { getAll, GetAllData } from 'src/utilities/getAll';

const getAllNotifications = getAll(getNotifications);

export const requestNotifications: ThunkActionCreator<
  Promise<GetAllData<Notification>>,
  void
> = () => (dispatch) => {
  dispatch(startRequest());
  return getAllNotifications()
    .then(({ data }) => {
      dispatch(handleSuccess(data));
      return data;
    })
    .catch((error) => {
      dispatch(handleError);
      return error;
    });
};
