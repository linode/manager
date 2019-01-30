import { pathOr } from 'ramda';
import { getUsers } from 'src/services/account';
import { getStackscripts } from 'src/services/stackscripts';

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
  filter?: any
) =>
  getUsers().then(response => {
    if (response.data.length === 1) {
      return Promise.resolve(emptyResult);
    }

    return getStackscripts(params, {
      ...filter,
      '+and': [
        {
          '+or': response.data.reduce(
            (acc, user) =>
              user.username === currentUser
                ? acc
                : [...acc, { username: user.username }],
            []
          )
        }
      ]
    });
  });

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
