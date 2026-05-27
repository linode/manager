import { statusToActionMap } from '../AlertsListing/constants';

import type { ActionHandlers } from '../AlertsListing/AlertActionMenu';
import type { AlertDefinitionType, AlertStatusType } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

/**
 * Parameters required to generate the actions list for alert types.
 */
interface GetAlertTypeToActionsListParams {
  /**
   * Current status of the alert definition.
   * Used to determine action availability and status change labels.
   */
  alertStatus: AlertStatusType;

  /**
   * Whether the Clone action should be included in the actions list.
   *
   * @default false
   */
  cloneEnabled?: boolean;

  /**
   * List of alert statuses for which edit-related actions
   * such as Edit, Delete, or Clone should be disabled.
   *
   * @default []
   */
  editDisableStatuses?: AlertStatusType[];

  /**
   * Collection of action handlers invoked by the action menu items.
   */
  handlers: ActionHandlers;
}

/**
 * Returns the available actions for each alert definition type.
 *
 * @param params Configuration used to build the actions list.
 * @returns Mapping of alert definition type to action items.
 */
export const getAlertTypeToActionsList = ({
  alertStatus,
  cloneEnabled = false,
  editDisableStatuses = [],
  handlers: {
    handleClone,
    handleDelete,
    handleDetails,
    handleEdit,
    handleStatusChange,
  },
}: GetAlertTypeToActionsListParams): Record<AlertDefinitionType, Action[]> => ({
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
    ...(cloneEnabled
      ? [
          {
            disabled: editDisableStatuses.includes(alertStatus),
            onClick: handleClone,
            title: 'Clone',
          },
        ]
      : []),
  ],
  user: [
    {
      onClick: handleDetails,
      title: 'Show Details',
    },
    {
      disabled: editDisableStatuses.includes(alertStatus),
      onClick: handleEdit,
      title: 'Edit',
    },
    {
      disabled:
        alertStatus === 'failed' ||
        alertStatus === 'provisioning' ||
        alertStatus === 'enabling' ||
        alertStatus === 'disabling',
      onClick: handleStatusChange,
      title: getTitleForStatusChange(alertStatus),
    },
    {
      disabled: editDisableStatuses.includes(alertStatus),
      onClick: handleDelete,
      title: 'Delete',
    },
    ...(cloneEnabled
      ? [
          {
            disabled: editDisableStatuses.includes(alertStatus),
            onClick: handleClone,
            title: 'Clone',
          },
        ]
      : []),
  ],
});

export const getTitleForStatusChange = (alertStatus: AlertStatusType) => {
  return statusToActionMap[alertStatus];
};
