/**
 * _when_ is not guaranteed to exist if this is a maintenance notification
 *
 * _when_ could be in the past
 */

type Type = 'reboot-scheduled' | 'migration-scheduled';

export interface Maintenance {
  type: Type;
  when: string | null;
  until: string | null;
}

export interface LinodeWithMaintenance extends Linode.Linode {
  maintenance?: Maintenance;
}

export const addNotificationsToLinodes = (
  notifications: Linode.Notification[],
  linodes: Linode.Linode[]
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
            when: foundNotification.when,
            until: foundNotification.until,
            type: foundNotification.label as Type
          }
        }
      : eachLinode;
  });
};
