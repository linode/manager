import { getStackscripts } from 'src/services/stackscripts';

export const getStackScriptsByUser = (username: string, params?: any, filter?: any) =>
  getStackscripts(params, {
    username,
    ...filter,
  });

export const getCommunityStackscripts = (currentUser: string, params?: any, filter?: any) =>
  getStackscripts(params, {
    '+and': [
      { username: { '+neq': 'linode' } },
      { username: { '+neq': currentUser } },
    ],
    ...filter
  });