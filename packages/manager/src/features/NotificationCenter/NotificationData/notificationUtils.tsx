import { NotificationType } from '@linode/api-v4';

export const maintenanceNotificationTypes = [
  'maintenance',
  'maintenance_scheduled',
];

export const checkIfMaintenanceNotification = (type: NotificationType) => {
  return maintenanceNotificationTypes.includes(type);
};
