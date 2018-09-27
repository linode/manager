import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setParams, setURL, setXFilter } from 'src/services';

import { createOAuthClientSchema, updateOAuthClientSchema } from './account.schema';

type OAuthClient = Linode.OAuthClient;
type Page<T> = Linode.ResourcePage<T>;

export interface OAuthClientRequest {
  label: string;
  redirect_uri: string;
}

/**
 * getOAuthClients
 *
 * Returns a paginated list of OAuth apps authorized on your account.
 * 
 */
export const getOAuthClients = (params?: any, filter?: any) =>
  Request<Page<OAuthClient>>(
    setURL(`${API_ROOT}/account/oauth-clients`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  )
    .then(response => response.data);

/**
 * getOAuthClient
 *
 * Returns a single authorized OAuth app
 * 
 * @param clientId { number } the ID of the OAuth client to retrieve
 * 
 */
export const getOAuthClient = (clientId: number) =>
  Request<string>(
    setURL(`${API_ROOT}/account/oauth-clients/${clientId}`),
    setMethod('GET'),
  )
    .then(response => response.data);

/**
 * createOAuthClient
 *
 * Create a new authorized OAuth client. The creation endpoint
 * will return a secret used for authenticating with the new app.
 * This secret will not be returned on subsequent requests 
 * (e.g. using getOAuthClient)
 * 
 */

export const createOAuthClient = (data: OAuthClientRequest) =>
  Request<OAuthClient & { secret: string }>(
    setURL(`${API_ROOT}/account/oauth-clients`),
    setMethod('POST'),
    setData(data, createOAuthClientSchema),
  )
    .then(response => response.data);

/**
 * getPersonalAccessTokens
 *
 * Returns a paginated list of Personal Access Tokens currently active for your User.
 * 
 */
export const resetOAuthClientSecret = (clientId: number | string) =>
  Request<OAuthClient & { secret: string }>(
    setURL(`${API_ROOT}/account/oauth-clients/${clientId}/reset-secret`),
    setMethod('POST'),
  )
    .then(response => response.data);

/**
 * getPersonalAccessTokens
 *
 * Returns a paginated list of Personal Access Tokens currently active for your User.
 * 
 */
export const updateOAuthClient = (clientId: number, data: Partial<OAuthClientRequest>) =>
  Request<OAuthClient>(
    setURL(`${API_ROOT}/account/oauth-clients/${clientId}`),
    setMethod('PUT'),
    setData(data, updateOAuthClientSchema),
  )
    .then(response => response.data);

/**
 * getPersonalAccessTokens
 *
 * Returns a paginated list of Personal Access Tokens currently active for your User.
 * 
 */
export const deleteOAuthClient = (clientId: number | string) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/oauth-clients/${clientId}`),
    setMethod('DELETE'),
  );
