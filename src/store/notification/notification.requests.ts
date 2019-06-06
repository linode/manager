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
      const mockData = {
        results: 5,
        page: 1,
        data: [
          {
            until: null,
            entity: {
              url: '/linode/instances/500',
              id: 14194386,
              type: 'linode',
              label: 'loadbal1-vagrant'
            },
            when: null,
            body: null,
            severity: 'major',
            type: 'migration_scheduled',
            label: 'You have a scheduled migration pending!',
            message:
              'You have a scheduled migration pending!  Your Linode will be automatically shut down, migrated, and returned to its last state.'
          },
          {
            until: null,
            entity: {
              url: '/linode/instances/504',
              id: 14194386,
              type: 'linode',
              label: 'loadbal5-xengrant'
            },
            when: null,
            body: null,
            severity: 'major',
            type: 'migration_pending',
            label: 'You have a migration pending!',
            message:
              'You have a migration pending! Your Linode must be offline before starting the migration.'
          },
          {
            until: null,
            entity: {
              url: '/linode/instances/500',
              id: 14194386,
              type: 'linode',
              label: 'loadbal1-vagrant'
            },
            when: '2019-06-29T15:32:26',
            body:
              'This Linode resides on a host that is pending critical maintenance. You should have recieved a support ticket that details how you will be affected. Please see the aformentioned ticket and [status.linode.com](https://status.linode.com/) for more details.',
            severity: 'critical',
            type: 'maintenance',
            label: 'zombieload-migration-scheduled',
            message: 'This Linode will be affected by critical maintenance!'
          },
          {
            until: null,
            entity: {
              url: '/linode/instances/500',
              id: 14049822,
              type: 'linode',
              label: 'loadbal1-vagrant'
            },
            when: '2019-10-29T15:32:26',
            body:
              'This Linode resides on a host that is pending critical maintenance. You should have recieved a support ticket that details how you will be affected. Please see the aformentioned ticket and [status.linode.com](https://status.linode.com/) for more details.',
            severity: 'critical',
            type: 'maintenance',
            label: 'zombieload-migration-scheduled',
            message: 'This Linode will be affected by critical maintenance!'
          },
          {
            until: null,
            entity: {
              url: '/linode/instances/500',
              id: 14194386,
              type: 'linode',
              label: 'loadbal1-vagrant'
            },
            when: '2019-02-28T15:32:26',
            body:
              'This Linode resides on a host that is pending critical maintenance. You should have recieved a support ticket that details how you will be affected. Please see the aformentioned ticket and [status.linode.com](https://status.linode.com/) for more details.',
            severity: 'critical',
            type: 'maintenance',
            label: 'zombieload-migration-scheduled',
            message: 'This Linode will be affected by critical maintenance!'
          },
          {
            until: null,
            entity: {
              url: '/linode/instances/507',
              id: 14194386,
              type: 'linode',
              label: 'loadbal8-xengrant'
            },
            when: '2020-03-22T18:58:41',
            body:
              'This Linode resides on a host that is pending critical maintenance. You should have recieved a support ticket that details how you will be affected. Please see the aformentioned ticket and [status.linode.com](https://status.linode.com/) for more details.',
            severity: 'critical',
            type: 'maintenance',
            label: 'zombieload-reboot-scheduled',
            message: 'This Linode will be affected by critical maintenance!'
          },
          {
            until: null,
            entity: {
              url: '/linode/instances/507',
              id: 14194386,
              type: 'linode',
              label: 'loadbal8-xengrant'
            },
            when: '2019-03-22T18:58:41',
            body:
              'This Linode resides on a host that is pending critical maintenance. You should have recieved a support ticket that details how you will be affected. Please see the aformentioned ticket and [status.linode.com](https://status.linode.com/) for more details.',
            severity: 'critical',
            type: 'maintenance',
            label: 'zombieload-reboot-scheduled',
            message: 'This Linode will be affected by critical maintenance!'
          }
        ],
        pages: 1
      };

      dispatch(handleSuccess(mockData.data));
      return mockData.data;
    })
    .catch(error => {
      dispatch(handleError);
      return error;
    });
};
