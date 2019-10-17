import { Notification } from 'linode-js-sdk/lib/account';
import { linode1 } from 'src/__data__/linodes';
import { addNotificationsToLinodes } from './linodes.helpers';

const maintenanceNotification: (
  linodeID: number
) => Notification[] = linodeID => [
  {
    label: 'reboot',
    message: 'This Linode is in Danger! Ahhhhh',
    type: 'maintenance',
    severity: 'critical',
    entity: {
      id: linodeID,
      label: 'linode1234',
      type: 'linode',
      url: 'https://hello.world'
    },
    when: '2019-10-17 21:52:28',
    until: '2019-10-17 21:52:28',
    body: null
  }
];

describe('Linode Redux Helpers', () => {
  it('should add relevant notifications to Linodes', () => {
    expect(
      addNotificationsToLinodes(maintenanceNotification(linode1.id), [linode1])
    ).toEqual([
      {
        ...linode1,
        maintenance: {
          when: '2019-10-17 21:52:28',
          until: '2019-10-17 21:52:28',
          type: 'reboot'
        }
      }
    ]);
  });

  it('returns Linode with `maintenance: null` if there are no notifications', () => {
    expect(
      addNotificationsToLinodes(maintenanceNotification(4325345345), [linode1])
    ).toEqual([
      {
        ...linode1,
        maintenance: null
      }
    ]);

    expect(addNotificationsToLinodes([], [linode1])).toEqual([
      {
        ...linode1,
        maintenance: null
      }
    ]);
  });
});
