import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import { getNotificationChannelActionsList } from '../Utils/utils';

import type { AlertNotificationType } from '@linode/api-v4';

export interface NotificationChannelActionHandlers {
  /**
   * Callback for show details action
   */
  handleDetails: () => void;
}

export interface NotificationChannelActionMenuProps {
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
  const { channelLabel, handlers, notificationType } = props;

  return (
    <ActionMenu
      actionsList={
        getNotificationChannelActionsList(handlers)[notificationType] || []
      }
      ariaLabel={`Action menu for Notification Channel ${channelLabel}`}
    />
  );
};
