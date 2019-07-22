import { pathOr } from 'ramda';
import { ResourcesState } from 'src/store';

export default (state: ResourcesState) => {
  const notifications = pathOr([], ['notifications', 'data'], state);
  return notifications.filter(
    (thisNotification: Linode.Notification) =>
      thisNotification.type === 'ticket_abuse'
  );
};
