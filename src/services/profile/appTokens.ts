import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '../index';

type Page<T> = Linode.ResourcePage<T>;
export interface Token {
  id: number,
  scopes: string,
  label: string,
  created: string,
  token?: string,
  expiry: string,
  website?: string,
  thumbnail_url?: null | string;
};

/**
 * getAppTokens
 *
 * Returns list of apps that have been authorized to access your account.
 * 
 */
export const getAppTokens = () =>
  Request<Page<Token>>(
    setMethod('GET'),
    setURL(`${API_ROOT}/profile/apps`),
  )
    .then(response => response.data);

/**
 * getAppToken
 *
 * Returns information about a single app you've authorized to access your account.
 * 
 * @param tokenId { number } the Id of the App Token to retrieve.
 */
export const getAppToken = (tokenId: number) =>
  Request<Token>(
    setMethod('GET'),
    setURL(`${API_ROOT}/profile/apps/${tokenId}`),
  )
    .then(response => response.data);

// @todo is this method even a thing? doesn't seem to be used anywhere
/**
 * createAppToken
 *
 * Generate an App Token to authorize an external app to access your account.
 * 
 * @example createAppToken();
 */
export const createAppToken = (data: Token) =>
  Request<Token>(
    setMethod('POST'),
    setURL(`${API_ROOT}/profile/apps`),
    setData(data),
  )
    .then(response => response.data);

/**
 * updateAppToken
 *
 * @todo I don't think this is really a thing either.
 * 
 */
export const updateAppToken = (tokenId: number, data: Partial<Token>) =>
  Request<Token>(
    setURL(`${API_ROOT}/profile/apps/${tokenId}`),
    setMethod('PUT'),
    setData(data),
  )
    .then(response => response.data);

/**
 * deleteAppToken
 *
 * Delete a single App Token
 * 
 * @param tokenId { number } the ID of the token to be deleted.
 */
export const deleteAppToken = (tokenId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/profile/apps/${tokenId}`),
    setMethod('DELETE'),
  );

