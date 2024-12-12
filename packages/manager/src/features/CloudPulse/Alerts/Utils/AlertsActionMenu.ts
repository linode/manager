import type { ActionHandlers } from '../AlertsListing/AlertActionMenu';
import type { AlertDefinitionType } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

/**
 * @param onClickHandlers The list of handlers required to be called on click of an action
 * @returns The actions based on the type of the alert
 */
export const getAlertTypeToActionsList = ({
  handleDetails,
}: ActionHandlers): Record<AlertDefinitionType, Action[]> => ({
  // for now there is system and user alert types, may be in future more alert types can be added and action items will differ according to alert types
  system: [
    {
      disabled: false,
      onClick: handleDetails,
      title: 'Show Details',
    },
  ],
  user: [
    {
      disabled: false,
      onClick: handleDetails,
      title: 'Show Details',
    },
  ],
});
