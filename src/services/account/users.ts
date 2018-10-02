import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL } from 'src/services';

type Page<T> = Linode.ResourcePage<T>;

export const getUsers = () =>
  Request<Page<Linode.User>>(
    setURL(`${API_ROOT}/account/users`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getUser = (username: string) =>
  Request<Linode.User>(
    setURL(`${API_ROOT}/account/users/${username}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const createUser = (data: Partial<Linode.User>) =>
  Request<Linode.User>(
    setURL(`${API_ROOT}/account/users`),
    setMethod('POST'),
    setData(data),
  )
    .then(response => response.data);

export const updateUser = (username: string, data: Partial<Linode.User>) =>
  Request<Linode.User>(
    setURL(`${API_ROOT}/account/users/${username}`),
    setMethod('PUT'),
    setData(data),
  )
    .then(response => response.data);

export const deleteUser = (username: string) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/users/${username}`),
    setMethod('DELETE'),
  )
    .then(response => response.data);

export const getGrants = (username: string) =>
  Request<Linode.Grants>(
    setURL(`${API_ROOT}/account/users/${username}/grants`),
    setMethod('GET'),
  )
    .then(response => response.data);
  
export const updateGrants = (username: string, data: Partial<Linode.Grants>) =>
  Request<Linode.Grants>(
    setURL(`${API_ROOT}/account/users/${username}/grants`),
    setMethod('PUT'),
    setData(data),
  )
    .then(response => response.data);