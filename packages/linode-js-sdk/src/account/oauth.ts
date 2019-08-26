import { API_ROOT } from '../constants';
import Request, { setData, setMethod, setParams, setURL, setXFilter } from '../request';
import { ResourcePage } from '../types'
import {
  createOAuthClientSchema,
  updateOAuthClientSchema
} from './account.schema'
import { OAuthClient, OAuthClientRequest } from './types';

/**
 * getOAuthClients
 *
 * Returns a paginated list of OAuth apps authorized on your account.
 *
 */
export const getOAuthClients = (params?: any, filter?: any) =>
  Request<ResourcePage<OAuthClient>>(
    setURL(`${API_ROOT}/account/oauth-clients`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  ).then(response => response.data);

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
    setMethod('GET')
  ).then(response => response.data);

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
    setData(data, createOAuthClientSchema)
  ).then(response => response.data);

/**
 * resetOAuthClientSecret
 *
 * Resets the OAuth Client secret for a client you own, and returns the OAuth Client
 * with the new secret in plaintext. This secret is not supposed to be publicly known
 * or disclosed anywhere. This can be used to generate a new secret in case the one
 * you have has been leaked, or to get a new secret if you lost the original.
 * The old secret is expired immediately, and logins to your client with the old secret will fail.
 *
 */
export const resetOAuthClientSecret = (clientId: number | string) =>
  Request<OAuthClient & { secret: string }>(
    setURL(`${API_ROOT}/account/oauth-clients/${clientId}/reset-secret`),
    setMethod('POST')
  ).then(response => response.data);

/**
 * updateOAuthClient
 *
 * Update the label and/or redirect uri of your OAuth client.
 *
 * @param clientId { number } the ID of the client to be updated
 */
export const updateOAuthClient = (
  clientId: string,
  data: Partial<OAuthClientRequest>
) =>
  Request<OAuthClient>(
    setURL(`${API_ROOT}/account/oauth-clients/${clientId}`),
    setMethod('PUT'),
    setData(data, updateOAuthClientSchema)
  ).then(response => response.data);

/**
 * deleteOAuthClient
 *
 * Deletes an OAuth Client registered with Linode.
 * The Client ID and Client secret will no longer be accepted by
 * https://login.linode.com, and all tokens issued to this client
 * will be invalidated (meaning that if your application was using
 * a token, it will no longer work).
 *
 * @param clientId { number } ID of the client to be deleted
 *
 */
export const deleteOAuthClient = (clientId: number | string) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/oauth-clients/${clientId}`),
    setMethod('DELETE')
  );
