import { getUsers } from 'src/services/account';
import { getStackscripts } from 'src/services/stackscripts';

export const emptyStackScriptsResult = {
  data: [],
  page: 1,
  pages: 1,
  results: 0
};

export const getStackScriptsByUser = (username: string, params?: any, filter?: any) =>
  getStackscripts(params, {
    ...filter,
    username,
  });

export const getAccountStackScripts = (currentUser: string, params?: any, filter?: any) =>
  getUsers().then(response => {
    if (response.data.length === 1) {
      return Promise.resolve(emptyStackScriptsResult); 
    }
    return getStackscripts(params, {
      ...filter,
      '+or': response.data.reduce((acc, user) => (
        user.username === currentUser ? acc : [...acc, { username: user.username }]),
        []
      ),
    });
  });

export const getCommunityStackscripts = (currentUser: string, params?: any, filter?: any) =>
  getUsers().then(response => getStackscripts(params, {
    ...filter,
    '+and': response.data.reduce(
      (acc, user) => ([...acc, { username: { '+neq': user.username } }]),
      [
        { username: { '+neq': 'linode' } }
      ]
    ),
  })
);