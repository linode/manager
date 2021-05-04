import {
  updateAccountSchema,
  UpdateAccountSettingsSchema,
} from '@linode/validation/lib/account.schema';
import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL } from 'src/request';
import {
  Account,
  AccountSettings,
  CancelAccount,
  CancelAccountPayload,
  NetworkUtilization,
} from './types';

/**
 * getAccountInfo
 *
 * Return account information,
 * including contact and billing info.
 *
 */
export const getAccountInfo = () => {
  return Request<Account>(setURL(`${API_ROOT}/account`), setMethod('GET'));
};

/**
 * getNetworkUtilization
 *
 * Return your current network transfer quota and usage.
 *
 */
export const getNetworkUtilization = () =>
  Request<NetworkUtilization>(
    setURL(`${API_ROOT}/account/transfer`),
    setMethod('GET')
  );

/**
 * updateAccountInfo
 *
 * Update your contact or billing information.
 *
 */
export const updateAccountInfo = (data: Partial<Account>) =>
  Request<Account>(
    setURL(`${API_ROOT}/account`),
    setMethod('PUT'),
    setData(data, updateAccountSchema)
  );

/**
 * getAccountSettings
 *
 * Retrieve general account-level settings.
 *
 */
export const getAccountSettings = () =>
  Request<AccountSettings>(
    setURL(`${API_ROOT}/account/settings`),
    setMethod('GET')
  );

/**
 * updateAccountSettings
 *
 * Update a user's account settings.
 *
 */
export const updateAccountSettings = (data: Partial<AccountSettings>) =>
  Request<AccountSettings>(
    setURL(`${API_ROOT}/account/settings`),
    setMethod('PUT'),
    setData(data, UpdateAccountSettingsSchema)
  );

/**
 * cancelAccount
 *
 * Cancels an account and returns a survey monkey link for a user to fill out
 */
export const cancelAccount = (data: CancelAccountPayload) => {
  return Request<CancelAccount>(
    setURL(`${API_ROOT}/account/cancel`),
    setMethod('POST'),
    setData(data)
  );
};
