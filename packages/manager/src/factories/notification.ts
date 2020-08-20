import * as Factory from 'factory.ts';
import { Notification, Entity } from '@linode/api-v4/lib/account';

const generateEntity = (id: number): Entity => ({
  type: 'linode',
  label: `linode-${id}`,
  id,
  url: `/linode/instances/${id}`
});

export const notificationFactory = Factory.Sync.makeFactory<Notification>({
  type: 'maintenance',
  entity: Factory.each(i => generateEntity(i)),
  when: '2020-10-16T01:00:00',
  message: 'This Linode will be affected by critical maintenance!',
  label: 'maintenance',
  severity: 'critical',
  until: null,
  body:
    'This Linode resides on a host that is pending critical maintenance. You should have received a support ticket that details how you will be affected. Please see the aforementioned ticket and [status.linode.com](https://status.linode.com/) for more details.'
});
