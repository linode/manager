import { Notification } from '@linode/api-v4/lib/account';
import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { DateTime } from 'luxon';

export const useNotifications = () => {
  const notifications = useSelector(
    (state: ApplicationState) => state.__resources.notifications
  );

  const balance = useSelector(
    (state: ApplicationState) => state.__resources.account.data?.balance
  );
  const dayOfMonth = DateTime.local().day;

  const pastDueNotification: Notification = {
    entity: null,
    label: 'past due',
    message: `You have a past due balance of $${balance}. Please make a payment immediately to avoid service disruption.`,
    type: 'payment_due',
    severity: 'critical',
    when: null,
    until: null,
    body: null
  };

  return {
    notifications: notifications.data ?? [],
    combinedNotifications:
      balance && balance > 0 && dayOfMonth >= 3
        ? notifications.data
          ? [pastDueNotification].concat(notifications?.data)
          : [pastDueNotification]
        : notifications.data ?? []
  };
};

export default useNotifications;
