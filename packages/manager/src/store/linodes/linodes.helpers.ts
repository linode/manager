import { Notification } from 'linode-js-sdk/lib/account';
import { Linode } from 'linode-js-sdk/lib/linodes';
import formatDate from 'src/utilities/formatDate';
import { LinodeWithMaintenance, Type } from './types';

export const addNotificationsToLinodes = (
  notifications: Notification[] = [],
  linodes: Linode[]
): LinodeWithMaintenance[] => {
  const maintenanceNotifications = notifications.filter(eachNotification => {
    return eachNotification.type === 'maintenance';
  });

  /** add the "maintenance" key to the Linode if we have one */
  return linodes.map(eachLinode => {
    const foundNotification = maintenanceNotifications.find(
      eachNotification => {
        return eachNotification.entity!.id === eachLinode.id;
      }
    );

    return foundNotification
      ? {
          ...eachLinode,
          maintenance: {
            /**
             * "when" and "until" are not guaranteed to exist
             * if we have a maintenance notification
             */
            when:
              typeof foundNotification.when === 'string'
                ? formatDate(foundNotification.when)
                : foundNotification.when,
            until:
              typeof foundNotification.until === 'string'
                ? formatDate(foundNotification.until)
                : foundNotification.until,
            type: foundNotification.label as Type
          }
        }
      : {
          ...eachLinode,
          maintenance: null
        };
  });
};
