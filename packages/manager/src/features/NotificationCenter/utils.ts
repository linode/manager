import type {
  Notification,
  NotificationSeverity,
  NotificationType,
} from '@linode/api-v4';

export const maintenanceNotificationTypes: Partial<NotificationType>[] = [
  'maintenance',
  'maintenance_scheduled',
] as const;

export const checkIfMaintenanceNotification = (type: NotificationType) => {
  return maintenanceNotificationTypes.includes(type);
};

export const isEUModelContractNotification = (notification: Notification) => {
  return (
    notification.type === 'notice' && /eu-model/gi.test(notification.message)
  );
};

/**
 * For communicative purposes in the UI, in some cases we want to adjust the severity of certain notifications compared to what the API returns.
 * If it is a maintenance notification of any sort, we display them as major instead of critical. Otherwise, we return the existing severity.
 */
export const adjustSeverity = ({
  severity,
  type,
}: Notification): NotificationSeverity => {
  if (checkIfMaintenanceNotification(type)) {
    return 'major';
  }

  return severity;
};

export const getEntityLinks = (
  notificationType?: NotificationType,
  entityType?: string,
  id?: number
) => {
  // Handle specific notification types
  if (notificationType === 'ticket_abuse') {
    return `/support/tickets/${id}`;
  }

  // The only entity.type we currently expect and can handle for is "linode"
  return entityType === 'linode' ? `/linodes/${id}` : null;
};
