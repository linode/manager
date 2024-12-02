import type { ActionHandlers } from '../AlertsListing/AlertActionMenu';
import type { AlertDefinitionType } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

/**
 *
 * @param onClickHandlers The list of handlers required to be called, on click of an action
 * @returns The actions based on the type of the alert
 */
export const getAlertTypeToActionsList = (
  onClickHandlers: ActionHandlers
): Record<AlertDefinitionType, Action[]> => ({
  // for now there is custom and default alert types, may be in future more alert types can be added
  system: [
    {
      disabled: false,
      onClick: onClickHandlers.handleDetails,
      title: 'Show Details',
    },
  ],
  user: [
    {
      disabled: false,
      onClick: onClickHandlers.handleDetails,
      title: 'Show Details',
    },
  ],
});
