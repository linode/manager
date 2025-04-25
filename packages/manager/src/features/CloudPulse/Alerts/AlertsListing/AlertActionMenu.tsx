import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import { getAlertTypeToActionsList } from '../Utils/AlertsActionMenu';

import type { AlertDefinitionType, AlertStatusType } from '@linode/api-v4';

export interface ActionHandlers {
  /**
   * Callback for delete action
   */
  handleDelete: () => void;

  /**
   * Callback for show details action
   */
  handleDetails: () => void;

  /**
   * Callback for edit alerts action
   */
  handleEdit: () => void;

  /**
   * Callback for enable/disable toggle action
   */
  handleStatusChange: () => void;
}

export interface AlertActionMenuProps {
  /**
   * The label of the alert
   */
  alertLabel: string;
  /**
   * Status of the alert
   */
  alertStatus: AlertStatusType;
  /**
   * Type of the alert
   */
  alertType: AlertDefinitionType;
  /**
   * Handlers for alert actions like delete, show details etc.,
   */
  handlers: ActionHandlers;
}

export const AlertActionMenu = (props: AlertActionMenuProps) => {
  const { alertLabel, alertStatus, alertType, handlers } = props;
  return (
    <ActionMenu
      actionsList={getAlertTypeToActionsList(handlers, alertStatus)[alertType]}
      ariaLabel={`Action menu for Alert ${alertLabel}`}
    />
  );
};
