import { pathOr } from 'ramda';
import { getUsers } from 'src/services/account';
import { getStackScript, getStackscripts } from 'src/services/stackscripts';

export const emptyResult = {
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

export const getAccountStackScripts = (
  currentUser: string,
  params?: any,
  filter?: any,
  stackScriptGrants?: Linode.Grant[]
) => {
  /*
    Secondary users can't see other account users but they have a list of
    available account stackscripts in grant call.
    If user is restricted we get the stackscripts for the list in grants.
    Otherwise we pull all stackscripts for users on the account.
  */
  if (stackScriptGrants) {
    if (params.page !== 0) {
      // disable other pages loading, we got all the account stackscripts with an initial call
      return Promise.resolve(emptyResult);
    }
    return Promise.all(
      stackScriptGrants.map(grant => getStackScript(grant.id))
    ).then(data => {
      // Filter out current user stackscripts and add to data of a sample response
      return {
        ...emptyResult,
        data: data.filter(stackScript => stackScript.username !== currentUser)
      };
    });
  } else {
    return getUsers().then(response => {
      if (response.data.length === 1) {
        // there is only one user on the account. All his stackscripts are in "My StackScripts" tab.
        return Promise.resolve(emptyResult);
      }

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
              []
            )
          }
        ]
      });
    });
  }
};

export const getCommunityStackscripts = (
  currentUser: string,
  params?: any,
  filter?: any
) =>
  getUsers()
    .catch(
      (): Promise<Linode.ResourcePage<Linode.User>> =>
        Promise.resolve(emptyResult)
    )
    .then(response =>
      getStackscripts(params, {
        ...filter,
        '+and': response.data.reduce(
          // pull all stackScripts except linode and account users
          (acc, user) => [...acc, { username: { '+neq': user.username } }],
          [{ username: { '+neq': 'linode' } }]
        )
      })
    );

export const StackScriptTabs = [
  {
    title: 'My StackScripts',
    request: getStackScriptsByUser,
    category: 'my'
  },
  {
    title: 'Account StackScripts',
    request: getAccountStackScripts,
    category: 'account'
  },
  {
    title: 'Linode StackScripts',
    request: getStackScriptsByUser,
    category: 'linode'
  },
  {
    title: 'Community StackScripts',
    request: getCommunityStackscripts,
    category: 'community'
  }
];

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

export const getErrorText = (error: any) => {
  const reason = pathOr('', ['data', 'errors', 0, 'reason'], error);

  if (reason === 'Unauthorized') {
    return 'You are not authorized to view StackScripts for this account.';
  }
  return 'There was an error loading your StackScripts. Please try again later.';
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
