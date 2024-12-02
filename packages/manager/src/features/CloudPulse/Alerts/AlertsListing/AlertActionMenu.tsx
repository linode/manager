import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { AlertDefinitionType } from '@linode/api-v4';

export interface ActionHandlers {
  // These handlers will be enhanced based on the alert type and actions required
  /*
   * Callback for delete action
   */
  handleDelete: () => void;

  /*
   * Callback for show details action
   */
  handleDetails: () => void;
}

export interface AlertActionMenuProps {
  /*
   * Type of the alert
   */
  alertType?: AlertDefinitionType;
  /*
   * Handlers for alert actions like delete, show details etc.,
   */
  handlers?: ActionHandlers;
}

/*
The handlers and alertType are made optional only temporarily, they will be enabled but they are dependent on another feature which will be part of next PR
*/
export const AlertActionMenu = () => {
  return <ActionMenu actionsList={[]} ariaLabel={'Action menu for Alert'} />;
};
