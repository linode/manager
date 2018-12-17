import { getStackscripts } from 'src/services/stackscripts';

export const getStackScriptsByUser = (username: string, params?: any, filter?: any) =>
  getStackscripts(params, {
    ...filter,
    username,
  });

  export const getStackScriptsByUsers = (usernames: string[], params?: any, filter?: any) =>
  getStackscripts(params, {
    ...filter,
    '+or': usernames.map(name => ({ username: name })),
  });

export const getCommunityStackscripts = (currentUser: string[], params?: any, filter?: any) =>
  getStackscripts(params, {
    ...filter,
    '+and': [
      { username: { '+neq': 'linode' } },
      { username: { '+neq': currentUser } },
    ],
  });