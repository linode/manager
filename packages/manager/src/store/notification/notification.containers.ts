import { Notification } from 'linode-js-sdk/lib/account';
import { connect } from 'react-redux';
import { ApplicationState } from '..';
import { ThunkActionCreator } from '../types';
import { State } from './notification.reducer';
import { requestNotifications } from './notification.requests';

interface Actions {
  requestNotifications: ThunkActionCreator<Promise<Notification[]>>;
}

const actions: Actions = {
  requestNotifications
};

export interface WithNotifications {
  notifications: Notification[];
  notificationsError: Linode.ApiFieldError[];
  notificationsLastUpdated: number;
  notificationsLoading: boolean;
}

const defaultMapState = ({ data, error, lastUpdated, loading }: State) => ({
  notifications: data || [],
  notificationsError: error,
  notificationsLastUpdated: lastUpdated,
  notificationsLoading: loading
});

const defaultMapDispatch = () => ({});

export const withNotifications = (
  mapState: (s: State) => any = defaultMapState,
  mapDispatch: (actions: Actions) => any = defaultMapDispatch
) =>
  connect(
    (state: ApplicationState) => mapState(state.__resources.notifications),
    mapDispatch(actions)
  );
