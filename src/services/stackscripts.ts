import { API_ROOT } from 'src/constants';
import Request, {
  setURL,
  setMethod,
  setParams,
  setXFilter,
} from './index';

type Page<T> = Linode.ResourcePage<T>;
type StackScript = Linode.StackScript.Response;

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
//     ],
//     ...filter,
//   });

export const getCommunityStackscripts = () =>
  getStackscripts();
