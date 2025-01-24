import type { ActionHandlers } from '../AlertsListing/AlertActionMenu';
import type { AlertDefinitionType } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

/**
 * @param onClickHandlers The list of handlers required to be called on click of an action
 * @returns The actions based on the type of the alert
 */
export const getAlertTypeToActionsList = ({
  handleDetails,
  handleEdit,
}: ActionHandlers): Record<AlertDefinitionType, Action[]> => ({
  custom: [
    {
      onClick: handleDetails,
      title: 'Show Details',
    },
  ],
  default: [
    {
      onClick: handleDetails,
      title: 'Show Details',
    },
    {
      onClick: handleEdit,
      title: 'Edit',
    },
  ],
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
  ],
});
