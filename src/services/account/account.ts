import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL } from 'src/services';

import { updateAccountSchema } from './account.schema';

/**
 * getAccountInfo
 *
 * Return account information,
 * including contact and billing info.
 * 
 */
export const getAccountInfo = () =>
  Request<Linode.Account>(
    setURL(`${API_ROOT}/account`),
    setMethod('GET'),
  )
  .then(response => response.data);

/**
 * updateAccountInfo
 *
 * Update your contact or billing information.
 * 
 */
export const updateAccountInfo = (data: Partial<Linode.Account>) =>
  Request<Linode.Account>(
    setURL(`${API_ROOT}/account`),
    setMethod('PUT'),
    setData(data, updateAccountSchema),
  )
  .then(response => response.data);

/**
 * getNetworkUtilization
 *
 * Return your current network transfer quota and usage.
 * 
 */
export const getNetworkUtilization = () =>
  Request<Linode.NetworkUtilization>(
    setURL(`${API_ROOT}/account/transfer`),
    setMethod('GET'),
  )
  .then(response => response.data);

/**
 * getAccountSettings
 *
 * Retrieve general account-level settings.
 * 
 */
export const getAccountSettings = () =>
  Request<Linode.AccountSettings>(
    setURL(`${API_ROOT}/account/settings`),
    setMethod('GET')
  )
  .then(response => response.data);
