import type { Notification } from '@linode/api-v4';

export interface NotificationCenterNotificationsItem {
  body: JSX.Element | string;
  countInTotal: boolean;
  eventId: number;
  id: string;
  showProgress?: boolean;
}

export interface FormattedNotificationProps extends Notification {
  jsx?: JSX.Element;
}

export interface NotificationCenterNotificationMessageProps {
  notification: FormattedNotificationProps;
  onClose: () => void;
}
