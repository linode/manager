import { Notification } from 'linode-js-sdk/lib/account';
import { formatDate } from './formatDate';

export const formatNotifications = (notifications: Notification[]) =>
  notifications.map(eachNotification => ({
    ...eachNotification,
    /** alter when and until to respect the user's timezone */
    when:
      typeof eachNotification.when === 'string'
        ? formatDate(eachNotification.when)
        : eachNotification.when,
    until:
      typeof eachNotification.until === 'string'
        ? formatDate(eachNotification.until)
        : eachNotification.until
  }));
