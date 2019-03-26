import { getUsers } from 'src/services/account';
import { getStackScript, getStackscripts } from 'src/services/stackscripts';

export const emptyResult: Linode.ResourcePage<Linode.StackScript.Response> = {
  data: [],
  page: 1,
  pages: 1,
  results: 0
};

export const getStackScriptsByUser = (
  username: string,
  params?: any,
  filter?: any
) =>
  getStackscripts(params, {
    ...filter,
    username
  });

export const getMineAndAccountStackScripts = (
  currentUser: string,
  params?: any,
  filter?: any,
  stackScriptGrants?: Linode.Grant[]
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
     * in this case, we are unrestricted user, so instead of getting the
     * StackScripts from the /grants meta data, need to get a list of all
     * users on the account and make a GET /stackscripts call with the list
     * of users as a filter
     */
    return getUsers().then(response => {
      return getStackscripts(params, {
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
  filter?: any
) =>
  getUsers().then(response => {
    return getStackscripts(params, {
      ...filter,
      '+and': response.data.reduce(
        // pull all stackScripts except linode and account users
        (acc, user) => [...acc, { username: { '+neq': user.username } }],
        [{ username: { '+neq': 'linode' } }]
      )
    });
  });

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
  label: string,
  currentUser?: string
) => {
  let type;
  let subtype;
  switch (username) {
    case 'linode':
      // This is a Cloud App (unless it isn't, which we are unable to handle at this time)
      type = 'One-Click';
      subtype = 'One-Click%20Apps';
      break;
    case currentUser:
      // My StackScripts
      type = 'My%20Images';
      subtype = 'My%20StackScripts';
      break;
    default:
      // Community StackScripts
      type = 'One-Click';
      subtype = 'Community%20StackScripts';
  }
  return `/linodes/create?type=${type}&stackScriptID=${id}&stackScriptUsername=${username}&stackScriptLabel=${label}&subtype=${subtype}`;
};
