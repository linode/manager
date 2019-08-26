import { Notification } from 'linode-js-sdk/lib/account'
import { pathOr } from 'ramda';
import { ResourcesState } from 'src/store';

export default (state: ResourcesState) => {
  const notifications = pathOr([], ['notifications', 'data'], state);
  return notifications.filter(
    (thisNotification: Notification) =>
      thisNotification.type === 'ticket_abuse'
  );
};
