import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import { getAlertTypeToActionsList } from '../Utils/AlertsActionMenu';

import type { AlertDefinitionType } from '@linode/api-v4';

export interface ActionHandlers {
  /*
   * Callback for show details action
   */
  handleDetails: () => void;
}

export interface AlertActionMenuProps {
  /**
   * Type of the alert
   */
  alertType: AlertDefinitionType;
  /**
   * Handlers for alert actions like delete, show details etc.,
   */
  handlers: ActionHandlers;
}

/**
 * The handlers and alertType are made optional only temporarily, they will be enabled but they are dependent on another feature which will be part of next PR
 */
export const AlertActionMenu = (props: AlertActionMenuProps) => {
  const { alertType, handlers } = props;
  return (
    <ActionMenu
      actionsList={
        handlers && alertType
          ? getAlertTypeToActionsList(handlers)[alertType]
          : []
      }
      ariaLabel={'Action menu for Alert'}
    />
  );
};
