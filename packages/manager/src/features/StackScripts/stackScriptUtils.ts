import { Grant } from '@linode/api-v4/lib/account';
import { StackScript, getStackScripts } from '@linode/api-v4/lib/stackscripts';
import { Filter, Params, ResourcePage } from '@linode/api-v4/lib/types';

import type { StackScriptsRequest } from './types';

export type StackScriptCategory = 'account' | 'community';

export const emptyResult: ResourcePage<StackScript> = {
  data: [],
  page: 1,
  pages: 1,
  results: 0,
};

const oneClickFilter = [
  {
    '+and': [
      { '+or': [{ username: 'linode-stackscripts' }, { username: 'linode' }] },
      {
        label: {
          '+contains': 'One-Click',
        },
      },
    ],
  },
  { '+order_by': 'ordinal' },
];

export const getOneClickApps = (params?: Params) =>
  getStackScripts(params, oneClickFilter);

export const getStackScriptsByUser: StackScriptsRequest = (
  username: string,
  params?: Params,
  filter?: Filter
) =>
  getStackScripts(params, {
    ...filter,
    username,
  });

export const getMineAndAccountStackScripts: StackScriptsRequest = (
  params?: Params,
  filter?: Filter
) => {
  return getStackScripts(params, { ...filter, mine: true });
};

/**
 * Gets all StackScripts that don't belong to user "Linode"
 * and do not belong to any users on the current account
 */
export const getCommunityStackscripts: StackScriptsRequest = (
  params?: Params,
  filter?: Filter
) => {
  return getStackScripts(params, {
    ...filter,
    '+and': [
      { username: { '+neq': 'linode' } },
      // linode-stackscripts is the account name on dev for Marketplace Apps
      { username: { '+neq': 'linode-stackscripts' } },
    ],
    mine: false,
  });
};

export type AcceptedFilters = 'description' | 'label' | 'username';

export const generateSpecificFilter = (
  key: AcceptedFilters,
  searchTerm: string
) => {
  return {
    [key]: {
      ['+contains']: searchTerm,
    },
  };
};

export const generateCatchAllFilter = (searchTerm: string) => {
  return {
    ['+or']: [
      {
        label: {
          ['+contains']: searchTerm,
        },
      },
      {
        username: {
          ['+contains']: searchTerm,
        },
      },
      {
        description: {
          ['+contains']: searchTerm,
        },
      },
    ],
  };
};

export const getStackScriptUrl = (
  username: string,
  id: number,
  currentUser?: string
) => {
  let type;
  let subtype;
  switch (username) {
    case 'linode':
      // This is a Marketplace App
      type = 'One-Click';
      subtype = 'One-Click%20Apps';
      break;
    case currentUser:
      // My StackScripts
      // @todo: handle account stackscripts
      type = 'StackScripts';
      subtype = 'Account';
      break;
    default:
      // Community StackScripts
      type = 'StackScripts';
      subtype = 'Community';
  }
  return `/linodes/create?type=${type}&subtype=${subtype}&stackScriptID=${id}`;
};

export const canUserModifyAccountStackScript = (
  isRestrictedUser: boolean,
  stackScriptGrants: Grant[],
  stackScriptID: number
) => {
  // If the user isn't restricted, they can modify any StackScript on the account
  if (!isRestrictedUser) {
    return true;
  }

  // Look for permissions for this specific StackScript
  const grantsForThisStackScript = stackScriptGrants.find(
    (eachGrant: Grant) => eachGrant.id === Number(stackScriptID)
  );

  // If there are no permissions for this StackScript (permissions:"none")
  if (!grantsForThisStackScript) {
    return false;
  }

  // User must have "read_write" permissions to modify StackScript
  return grantsForThisStackScript.permissions === 'read_write';
};
