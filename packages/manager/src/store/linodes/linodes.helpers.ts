import { AccountMaintenance, Notification } from '@linode/api-v4/lib/account';
import { Linode } from '@linode/api-v4/lib/linodes';

// @todo: Delete this type and function after release and merge to develop.
type Type = 'reboot-scheduled' | 'migration-pending';

export const addNotificationsToLinodes = (
  notifications: Notification[],
  linodes: Linode[]
): LinodeWithMaintenance[] => {
  const maintenanceNotifications = notifications.filter((eachNotification) => {
    return eachNotification.type === 'maintenance';
  });

  /** add the "maintenance" key to the Linode if we have one */
  return linodes.map((eachLinode) => {
    const foundNotification = maintenanceNotifications.find(
      (eachNotification) => {
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
            type: foundNotification.label as Type,
          },
        }
      : {
          ...eachLinode,
          maintenance: null,
        };
  });
};

export interface Maintenance {
  when: string | null;
}

export interface LinodeWithMaintenance extends Linode {
  maintenance?: Maintenance | null;
}

export const addMaintenanceToLinodes = (
  accountMaintenance: AccountMaintenance[],
  linodes: Linode[]
): LinodeWithMaintenance[] => {
  return linodes.map((thisLinode) => {
    const foundMaintenance = accountMaintenance.find((thisMaintenance) => {
      return (
        thisMaintenance.entity.type === 'linode' &&
        thisMaintenance.entity.id === thisLinode.id
      );
    });

    return foundMaintenance
      ? {
          ...thisLinode,
          maintenance: {
            when: foundMaintenance.when,
          },
        }
      : { ...thisLinode, maintenance: null };
  });
};
