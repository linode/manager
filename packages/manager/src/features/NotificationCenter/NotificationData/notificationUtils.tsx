import { NotificationType } from '@linode/api-v4/lib/account';

export const maintenanceNotificationTypes = [
  'maintenance',
  'maintenance_scheduled',
];

export const checkIfMaintenanceNotification = (type: NotificationType) => {
  return maintenanceNotificationTypes.includes(type);
};
