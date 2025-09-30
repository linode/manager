import type { Notification } from '@linode/api-v4';

export const getAbuseTickets = (notifications: Notification[]) => {
  return notifications.filter(
    (thisNotification: Notification) => thisNotification.type === 'ticket_abuse'
  );
};
