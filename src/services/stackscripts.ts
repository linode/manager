import { API_ROOT } from 'src/constants';

import Request, { setMethod, setParams, setURL, setXFilter } from './index';

type Page<T> = Linode.ResourcePage<T>;
type StackScript = Linode.StackScript.Response;

export const getStackScript = (id: number) =>
  Request<StackScript>(
    setURL(`${API_ROOT}/linode/stackscripts/${id}`),
    setMethod('GET'),
  )
  .then(response => response.data);

export const getStackscripts = (params?: any, filter?: any) =>
  Request<Page<StackScript>>(
    setURL(`${API_ROOT}/linode/stackscripts`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  )
    .then(response => response.data);

export const getStackScriptsByUser = (username: string, params?: any, filter?: any) =>
  getStackscripts(params, {
    username,
    ...filter,
  });

// API does not currently support this
// export const getCommunityStackscripts = (currentUser: string, params?: any, filter?: any) =>
//   getStackscripts(params, {
//     '+and': [
//       { username: { '+not': 'linode' } },
//       { username: { '+not': currentUser } },
//       ...filter,
//     ],
//   });

export const getCommunityStackscripts = (currentUser: string, params?: any, filter?: any) =>
  getStackscripts(params, filter).then((response) => {
    const withoutOwnAndLinode = response.data.filter((stackScript) => {
      return stackScript.username !== 'linode' && stackScript.username !== currentUser;
    });
    return {
      ...response,
      data: withoutOwnAndLinode,
    };
  });
