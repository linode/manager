import { statusToActionMap } from '../AlertsListing/constants';

import type { ActionHandlers } from '../AlertsListing/AlertActionMenu';
import type { AlertDefinitionType, AlertStatusType } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

/**
 * @param onClickHandlers The list of handlers required to be called on click of an action
 * @returns The actions based on the type of the alert
 */
export const getAlertTypeToActionsList = (
  { handleDetails, handleEdit, handleEnableDisable }: ActionHandlers,
  alertStatus: AlertStatusType
): Record<AlertDefinitionType, Action[]> => ({
  // for now there is system and user alert types, in future more alert types can be added and action items will differ according to alert types
  system: [
    {
      onClick: handleDetails,
      title: 'Show Details',
    },
    {
      onClick: handleEdit,
      title: 'Edit',
    },
  ],
  user: [
    {
      onClick: handleDetails,
      title: 'Show Details',
    },
    {
      onClick: handleEdit,
      title: 'Edit',
    },
    {
      disabled: isStatusActionDisabled(alertStatus),
      onClick: handleEnableDisable,
      title: getTitleForEnableDisable(alertStatus),
    },
  ],
});

export const isStatusActionDisabled = (alertStatus: AlertStatusType) => {
  return alertStatus !== 'enabled' && alertStatus !== 'disabled';
};

export const getTitleForEnableDisable = (alertStatus: AlertStatusType) => {
  return statusToActionMap[alertStatus];
};
