import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setParams, setURL, setXFilter } from 'src/services';

import { CreateUserSchema } from './account.schema';

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
    setXFilter(filters),
  )
    .then(response => response.data);

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
    setMethod('GET'),
  )
    .then(response => response.data);

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
    setData(data),
  )
    .then(response => response.data);

/**
 * updateUser
 *
 * Returns the thumbnail for this OAuth Client.
 * This is a publicly-viewable endpoint, and can be accessed without authentication.
 * 
 * @param clientId { number } ID of the client to be viewed.
 * 
 */    
export const updateUser = (username: string, data: Partial<User>) =>
  Request<User>(
    setURL(`${API_ROOT}/account/users/${username}`),
    setMethod('PUT'),
    setData(data, CreateUserSchema),
  )
    .then(response => response.data);

/**
 * deleteUser
 *
 * Returns the thumbnail for this OAuth Client.
 * This is a publicly-viewable endpoint, and can be accessed without authentication.
 * 
 * @param clientId { number } ID of the client to be viewed.
 * 
 */    
export const deleteUser = (username: string) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/users/${username}`),
    setMethod('DELETE'),
  )
    .then(response => response.data);

/**
 * getGrants
 *
 * Returns the thumbnail for this OAuth Client.
 * This is a publicly-viewable endpoint, and can be accessed without authentication.
 * 
 * @param clientId { number } ID of the client to be viewed.
 * 
 */
export const getGrants = (username: string) =>
  Request<Linode.Grants>(
    setURL(`${API_ROOT}/account/users/${username}/grants`),
    setMethod('GET'),
  )
    .then(response => response.data);

/**
 * updateGrants
 *
 * Returns the thumbnail for this OAuth Client.
 * This is a publicly-viewable endpoint, and can be accessed without authentication.
 * 
 * @param clientId { number } ID of the client to be viewed.
 * 
 */
export const updateGrants = (username: string, data: Partial<Linode.Grants>) =>
  Request<Linode.Grants>(
    setURL(`${API_ROOT}/account/users/${username}/grants`),
    setMethod('PUT'),
    setData(data),
  )
    .then(response => response.data);
