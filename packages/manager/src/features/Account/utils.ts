import { useFlags } from 'src/hooks/useFlags';

import { ADMINISTRATOR, PARENT_USER } from './constants';

import type { GlobalGrantTypes, GrantLevel } from '@linode/api-v4';
import type { GrantTypeMap } from 'src/features/Account/types';

export type ActionType =
  | 'attach'
  | 'clone'
  | 'create'
  | 'download'
  | 'delete'
  | 'detach'
  | 'edit'
  | 'migrate'
  | 'modify'
  | 'reboot'
  | 'rebuild'
  | 'rescue'
  | 'resize'
  | 'resume'
  | 'suspend'
  | 'view';

interface GetRestrictedResourceText {
  action?: ActionType | ActionType[];
  includeContactInfo?: boolean;
  isChildUser?: boolean;
  isSingular?: boolean;
  resourceType: GrantTypeMap;
}

interface AccountAccessGrant {
  globalGrantType: 'account_access';
  permittedGrantLevel: GrantLevel;
}

interface NonAccountAccessGrant {
  globalGrantType: Exclude<GlobalGrantTypes, 'account_access'>;
  permittedGrantLevel?: GrantLevel;
}

// Discriminating union to determine the type of global grant
export type RestrictedGlobalGrantType =
  | AccountAccessGrant
  | NonAccountAccessGrant;

/**
 * Get a resource restricted message based on action(s) and resource type.
 */
export const getRestrictedResourceText = ({
  action = 'edit',
  includeContactInfo = true,
  isChildUser = false,
  isSingular = true,
  resourceType,
}: GetRestrictedResourceText): string => {
  const resource = isSingular
    ? 'this ' + resourceType.replace(/s$/, '')
    : resourceType;

  const contactPerson = isChildUser ? PARENT_USER : ADMINISTRATOR;

  const actionText = formatAction(action);

  let message = `You don't have permissions to ${actionText} ${resource}.`;

  if (includeContactInfo) {
    message += ` Please contact your ${contactPerson} to request the necessary permissions.`;
  }

  return message;
};

/**
 * Hook to determine if the Tax Id feature should be visible to the user.
 * Based on the user's account capability and the feature flag.
 *
 * @returns {boolean} - Whether the TaxId feature is enabled for the current user.
 */
export const useIsTaxIdEnabled = (): {
  isTaxIdEnabled: boolean;
} => {
  const flags = useFlags();

  if (!flags) {
    return { isTaxIdEnabled: false };
  }

  const isTaxIdEnabled = Boolean(flags.taxId?.enabled);

  return { isTaxIdEnabled };
};

/**
 * Formats one or more actions into a readable string
 * @param action - A single action or array of actions
 *
 * @returns A formatted string representing the action(s)
 */
function formatAction(action: ActionType | ActionType[]): string {
  if (!Array.isArray(action)) return action;

  const len = action.length;
  if (len === 1) return action[0];
  if (len === 2) return `${action[0]} or ${action[1]}`;

  return `${action.slice(0, -1).join(', ')}, or ${action[action.length - 1]}`;
}
