import { Notification } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { connect } from 'react-redux';
import { ApplicationState } from '..';
import { ThunkActionCreator } from '../types';
import { State } from './notification.reducer';
import { requestNotifications } from './notification.requests';
import { GetAllData } from 'src/utilities/getAll';

interface Actions {
  requestNotifications: ThunkActionCreator<Promise<GetAllData<Notification>>>;
}

const actions: Actions = {
  requestNotifications
};

export interface WithNotifications {
  notifications: Notification[];
  notificationsError: APIError[];
  notificationsLastUpdated: number;
  notificationsLoading: boolean;
  requestNotifications: () => Promise<GetAllData<Notification>>;
}

const defaultMapState = ({ data, error, lastUpdated, loading }: State) => ({
  notifications: data || [],
  notificationsError: error,
  notificationsLastUpdated: lastUpdated,
  notificationsLoading: loading
});

const defaultMapDispatch = () => ({
  requestNotifications
});

export const withNotifications = (
  mapState: (s: State) => any = defaultMapState,
  mapDispatch: (actions: Actions) => any = defaultMapDispatch
) =>
  connect(
    (state: ApplicationState) => mapState(state.__resources.notifications),
    mapDispatch(actions)
  );

export default withNotifications;
