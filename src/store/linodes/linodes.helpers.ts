/**
 * when is not guarenteed
 *
 * when could be in the past
 */

/**
 * this is what's coming back from the API, but we should absolutely not
 * be doing exact string matching on these
 */
type Type = 'zombieload-reboot-scheduled' | 'zombieload-migration-scheduled';

export interface LinodesWithMaintenance extends Linode.Linode {
  maintenance?: {
    type: Type;
    when: string | null;
    until: string | null;
  };
}

export const addNotificationsToLinodes = (
  notifications: Linode.Notification[],
  linodes: Linode.Linode[]
): LinodesWithMaintenance[] => {
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
            type: foundNotification.type as Type
          }
        }
      : eachLinode;
  });
};
