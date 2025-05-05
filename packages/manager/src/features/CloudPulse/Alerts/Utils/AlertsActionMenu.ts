import { statusToActionMap } from '../AlertsListing/constants';

import type { ActionHandlers } from '../AlertsListing/AlertActionMenu';
import type { AlertDefinitionType, AlertStatusType } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

/**
 * @param onClickHandlers The list of handlers required to be called on click of an action
 * @returns The actions based on the type of the alert
 */
export const getAlertTypeToActionsList = (
  {
    handleDelete,
    handleDetails,
    handleEdit,
    handleStatusChange,
  }: ActionHandlers,
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
      disabled: alertStatus === 'in progress' || alertStatus === 'failed',
      onClick: handleEdit,
      title: 'Edit',
    },
    {
      disabled: alertStatus === 'in progress' || alertStatus === 'failed',
      onClick: handleStatusChange,
      title: getTitleForStatusChange(alertStatus),
    },
    {
      disabled:
        /* Hardcoding it to be disabled for now as the API's are not ready yet, once they're available will remove the true. */
        alertStatus === 'in progress' || alertStatus === 'failed' || true,
      onClick: handleDelete,
      title: 'Delete',
    },
  ],
});

export const getTitleForStatusChange = (alertStatus: AlertStatusType) => {
  return statusToActionMap[alertStatus];
};
