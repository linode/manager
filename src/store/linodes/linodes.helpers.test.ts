import { linode1 } from 'src/__data__/linodes';
import { addNotificationsToLinodes } from './linodes.helpers';

const maintenanceNotification: (
  linodeID: number
) => Linode.Notification[] = linodeID => [
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
    when: 'rightnow',
    until: 'later',
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
          when: 'rightnow',
          until: 'later',
          type: 'reboot'
        }
      }
    ]);
  });

  expect(
    addNotificationsToLinodes(maintenanceNotification(4325345345), [linode1])
  ).toEqual([
    {
      ...linode1
    }
  ]);
});
