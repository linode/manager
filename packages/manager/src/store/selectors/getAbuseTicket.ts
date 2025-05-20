import type { Notification } from '@linode/api-v4/lib/account';

export const getAbuseTickets = (notifications: Notification[]) => {
  return notifications.filter(
    (thisNotification: Notification) => thisNotification.type === 'ticket_abuse'
  );
};
