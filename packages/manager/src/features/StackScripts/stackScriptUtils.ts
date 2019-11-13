import { getUsers, Grant } from 'linode-js-sdk/lib/account';
import {
  getStackScript,
  getStackScripts,
  StackScript
} from 'linode-js-sdk/lib/stackscripts';
import { ResourcePage } from 'linode-js-sdk/lib/types';

export type StackScriptCategory = 'account' | 'community';

export const emptyResult: ResourcePage<StackScript> = {
  data: [],
  page: 1,
  pages: 1,
  results: 0
};

/**
 * We need a way to make sure that newly added SS that meet
 * our filtering criteria don't automatically end up being
 * shown to the user before we've updated Cloud to support them.
 */
export const baseApps = {
  '401699': 'Ark - Latest One-Click',
  '401704': 'TF2 - Latest One-Click',
  '401705': 'Terraria - Latest One-Click',
  '401703': 'Rust - Latest One-Click',
  '401700': 'CS:GO - Latest One-Click',
  '401702': 'MERN One-Click',
  '401698': 'Drupal - Latest One-Click',
  '401707': 'GitLab - Latest One-Click',
  '401708': 'WooCommerce - Latest One-Click',
  '401706': 'WireGuard - Latest One-Click',
  '401709': 'Minecraft - Latest One-Click',
  '401701': 'LAMP One-Click',
  '401719': 'OpenVPN - Latest One-Click',
  '401697': 'WordPress - Latest One-Click',
  '595742': 'cPanel One-Click',
  '593835': 'Plesk One-Click'

};

const oneClickFilter = [
  {
    '+and': [
      { '+or': [{ username: 'linode-stackscripts' }, { username: 'linode' }] },
      {
        label: {
          '+contains': 'One-Click'
        }
      }
    ]
  },
  { '+order_by': 'ordinal' }
];

export const getOneClickApps = (params?: any) =>
  getStackScripts(params, oneClickFilter);

export const getStackScriptsByUser = (
  username: string,
  params?: any,
  filter?: any
) =>
  getStackScripts(params, {
    ...filter,
    username
  });

export const getMineAndAccountStackScripts = (
  currentUser: string,
  params?: any,
  filter?: any,
  stackScriptGrants?: Grant[]
) => {
  /**
   * Secondary users can't see other account users but they have a list of
   * available account stackscripts in grant call.
   * If user is restricted we get the stackscripts for the list in grants.
   * Otherwise we pull all stackscripts for users on the account.
   */
  if (stackScriptGrants) {
    /**
     * don't try to get another page of stackscripts because the request to /grants
     * already gave us all stackscripts results, non-paginated
     */
    if (params.page !== 1) {
      return Promise.resolve(emptyResult);
    }

    /**
     * From the grants request, we got the entire list of StackScripts this
     * user has access to, so we need to iterate over that list to get the
     * meta data about each StackScript
     */
    return Promise.all(
      stackScriptGrants.map(grant => getStackScript(grant.id))
    ).then(response => {
      return {
        ...emptyResult,
        data: response
      };
    });
  } else {
    /**
     * in this case, we are an unrestricted user, so instead of getting the
     * StackScripts from the /grants meta data, need to get a list of all
     * users on the account and make a GET /stackscripts call with the list
     * of users as a filter
     */
    return getUsers().then(response => {
      return getStackScripts(params, {
        ...filter,
        '+and': [
          {
            '+or': response.data.reduce(
              (acc, user) =>
                // append usernames but not the current user
                user.username === currentUser
                  ? acc
                  : [...acc, { username: user.username }],
              [{ username: currentUser }]
            )
          }
        ]
      });
    });
  }
};

/**
 * Gets all StackScripts that don't belong to user "Linode"
 * and do not belong to any users on the current account
 */
export const getCommunityStackscripts = (
  currentUser: string,
  params?: any,
  filter?: any,
  stackScriptGrants?: Grant[]
) => {
  if (stackScriptGrants) {
    // User is restricted, so can't ask for a list of account users
    return getStackScripts(params, {
      ...filter,
      '+and': [
        { username: { '+neq': currentUser } },
        { username: { '+neq': 'linode' } },
        // linode-stackscripts is the account name on dev for One-Click Apps
        { username: { '+neq': 'linode-stackscripts' } }
      ]
    });
  } else {
    return getUsers().then(response => {
      return getStackScripts(params, {
        ...filter,
        '+and': response.data.reduce(
          // pull all stackScripts except linode and account users
          (acc, user) => [...acc, { username: { '+neq': user.username } }],
          [
            { username: { '+neq': 'linode' } },
            // linode-stackscripts is the account name on dev for One-Click Apps
            { username: { '+neq': 'linode-stackscripts' } }
          ]
        )
      });
    });
  }
};

export type AcceptedFilters = 'username' | 'description' | 'label';

export const generateSpecificFilter = (
  key: AcceptedFilters,
  searchTerm: string
) => {
  return {
    [key]: {
      ['+contains']: searchTerm
    }
  };
};

export const generateCatchAllFilter = (searchTerm: string) => {
  return {
    ['+or']: [
      {
        label: {
          ['+contains']: searchTerm
        }
      },
      {
        username: {
          ['+contains']: searchTerm
        }
      },
      {
        description: {
          ['+contains']: searchTerm
        }
      }
    ]
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
      // This is a One-Click App
      type = 'One-Click';
      subtype = 'One-Click%20Apps';
      break;
    case currentUser:
      // My StackScripts
      // @todo: handle account stackscripts
      type = 'My%20Images';
      subtype = 'Account%20StackScripts';
      break;
    default:
      // Community StackScripts
      type = 'One-Click';
      subtype = 'Community%20StackScripts';
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
