import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import { getNotificationChannelActionsList } from '../Utils/utils';

import type { AlertNotificationType } from '@linode/api-v4';

export interface NotificationChannelActionHandlers {
  /**
   * Callback for delete action
   */
  handleDelete: () => void;
  /**
   * Callback for show details action
   */
  handleDetails: () => void;
  /**
   * Callback for edit action
   */
  handleEdit: () => void;
}

export interface NotificationChannelActionMenuProps {
  /**
   * Number of alerts associated with the notification channel
   */
  alertsCount: number;
  /**
   * The label of the Notification Channel
   */
  channelLabel: string;
  /**
   * Handlers for actions like delete, show details, etc.,
   */
  handlers: NotificationChannelActionHandlers;
  /**
   * Type of the notification channel
   */
  notificationType: AlertNotificationType;
}
export const NotificationChannelActionMenu = (
  props: NotificationChannelActionMenuProps
) => {
  const { channelLabel, handlers, notificationType, alertsCount } = props;

  return (
    <ActionMenu
      actionsList={
        getNotificationChannelActionsList({ handlers, alertsCount })[
          notificationType
        ] || []
      }
      ariaLabel={`Action menu for Notification Channel ${channelLabel}`}
    />
  );
};
