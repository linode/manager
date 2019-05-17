import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from 'src/services';

import { CreateUserSchema, UpdateUserSchema } from './account.schema';

type Page<T> = Linode.ResourcePage<T>;
type User = Linode.User;

/**
 * getUsers
 *
 * Returns a paginated list of users on this account.
 *
 */
export const getUsers = (params?: any, filters?: any) =>
  Request<Page<User>>(
    setURL(`${API_ROOT}/account/users`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  ).then(response => response.data);

/**
 * getUser
 *
 * Returns details about a single user.
 *
 * @param username { string } name of the user to be viewed.
 *
 */

export const getUser = (username: string) =>
  Request<User>(
    setURL(`${API_ROOT}/account/users/${username}`),
    setMethod('GET')
  ).then(response => response.data);

/**
 * createUser
 *
 * Add a new user to your account.
 *
 * @param data { object }
 *
 */
export const createUser = (data: Partial<User>) =>
  Request<User>(
    setURL(`${API_ROOT}/account/users`),
    setMethod('POST'),
    setData(data, CreateUserSchema)
  ).then(response => response.data);

/**
 * updateUser
 *
 * Update a user's information.
 *
 * @param username { string } username of the user to be updated.
 * @param data { object } The fields of the user object to be updated.
 *
 */

export const updateUser = (username: string, data: Partial<User>) =>
  Request<User>(
    setURL(`${API_ROOT}/account/users/${username}`),
    setMethod('PUT'),
    setData(data, UpdateUserSchema)
  ).then(response => response.data);

/**
 * deleteUser
 *
 * Remove a single user from your account.
 *
 * @param username { string } username of the user to be deleted.
 *
 */

export const deleteUser = (username: string) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/users/${username}`),
    setMethod('DELETE')
  ).then(response => response.data);

/**
 * getGrants
 *
 * Returns the full grants structure for this User. This includes all entities on
 * the Account alongside what level of access this User has to each of them. Individual
 * users may view their own grants at the /profile/grants endpoint,
 * but will not see entities that they have no access to.
 *
 * @param username { number } the username to look up.
 *
 */
export const getGrants = (username: string) =>
  Request<Linode.Grants>(
    setURL(`${API_ROOT}/account/users/${username}/grants`),
    setMethod('GET')
  ).then(response => response.data);

/**
 * updateGrants
 *
 * Update the grants a User has. This can be used to give a User access
 * to new entities or actions, or take access away. You do not need to include
 * the grant for every entity on the Account in this request;
 * any that are not included will remain unchanged.
 *
 * @param username { number } ID of the client to be viewed.
 * @param data { object } the Grants object to update.
 *
 */
export const updateGrants = (username: string, data: Partial<Linode.Grants>) =>
  Request<Linode.Grants>(
    setURL(`${API_ROOT}/account/users/${username}/grants`),
    setMethod('PUT'),
    setData(data)
  ).then(response => response.data);
