import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '..';

type Page<T> = Linode.ResourcePage<T>;
type Token = Linode.Token;

/** Personal Access Tokens */
export const createPersonalAccessToken = (data: any) =>
  Request<Token>(
    setMethod('POST'),
    setURL(`${API_ROOT}/profile/tokens`),
    setData(data),
  )
    .then(response => response.data);

export const getPersonalAccessToken = (id: number) =>
  Request<Token>(
    setMethod('GET'),
    setURL(`${API_ROOT}/profile/tokens/${id}`),
  )
    .then(response => response.data);

export const updatePersonalAccessToken = (id: number, data: any) =>
  Request<Token>(
    setURL(`${API_ROOT}/profile/tokens/${id}`),
    setMethod('PUT'),
    setData(data),
  )
    .then(response => response.data);

export const deletePersonalAccessToken = (id: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/profile/tokens/${id}`),
    setMethod('DELETE'),
  );

export const getPersonalAccessTokens = () =>
  Request<Page<Token>>(
    setMethod('GET'),
    setURL(`${API_ROOT}/profile/tokens`),
  )
    .then(response => response.data);