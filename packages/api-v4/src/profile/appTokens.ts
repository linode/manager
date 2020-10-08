import { API_ROOT } from 'src/constants';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';
import { ResourcePage as Page } from '../types';
import { Token } from './types';

/**
 * getAppTokens
 *
 * Returns list of apps that have been authorized to access your account.
 *
 */
export const getAppTokens = (params?: any, filters?: any) =>
  Request<Page<Token>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setURL(`${API_ROOT}/profile/apps`)
  );

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
    setURL(`${API_ROOT}/profile/apps/${tokenId}`)
  );

/**
 * deleteAppToken
 *
 * Delete a single App Token. Revokes this app's ability to
 * access the API.
 *
 * @param tokenId { number } the ID of the token to be deleted.
 */
export const deleteAppToken = (tokenId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/profile/apps/${tokenId}`),
    setMethod('DELETE')
  );
