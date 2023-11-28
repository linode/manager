import {
  updateAccountSchema,
  UpdateAccountSettingsSchema,
} from '@linode/validation/lib/account.schema';
import { API_ROOT, BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setURL,
  setParams,
  setXFilter,
} from 'src/request';
import {
  Account,
  AccountAvailability,
  AccountSettings,
  CancelAccount,
  CancelAccountPayload,
  Agreements,
  RegionalNetworkUtilization,
} from './types';
import { Filter, ResourcePage, Params } from 'src/types';
import { Token, TokenRequest } from 'src/profile';
import { createPersonalAccessTokenSchema } from '@linode/validation/lib/profile.schema';

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
  Request<RegionalNetworkUtilization>(
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

/**
 * getAccountAgreements
 *
 * Gets the state of all agreements (signed or unsigned).
 *
 */
export const getAccountAgreements = () =>
  Request<Agreements>(
    setURL(`${BETA_API_ROOT}/account/agreements`),
    setMethod('GET')
  );

/**
 * getAccountAvailabilities
 *
 * Gets the account's entity availability for each region. Specifically
 * tells which entities the account does not have capability for in each region.
 *
 */
export const getAccountAvailabilities = (params?: Params, filter?: Filter) =>
  Request<ResourcePage<AccountAvailability>>(
    setURL(`${BETA_API_ROOT}/account/availability`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  );

/**
 * getAccountAvailability
 *
 * Gets the account's entity availability for given region. Specifically
 * tells which entities the account does not have capability for in given region.
 *
 */
export const getAccountAvailability = (regionId: string) =>
  Request<AccountAvailability>(
    setURL(
      `${BETA_API_ROOT}/account/availability/${encodeURIComponent(regionId)}`
    ),
    setMethod('GET')
  );

/**
 * signAgreement
 *
 * Sign one or more agreements
 */
export const signAgreement = (data: Partial<Agreements>) => {
  return Request<{}>(
    setURL(`${BETA_API_ROOT}/account/agreements`),
    setMethod('POST'),
    setData(data)
  );
};

/**
 * getChildAccounts
 *
 * This endpoint will return a paginated list of all Child Accounts with a Parent Account.
 * The response would be similar to /account, except that it would list details for multiple accounts.
 */
export const getChildAccounts = (params?: Params, filter?: Filter) =>
  Request<ResourcePage<Account>>(
    setURL(`${API_ROOT}/account/child-accounts`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  );

/**
 * getChildAccount
 *
 * This endpoint will function similarly to /account/child-accounts,
 * except that it will return account details for only a specific euuid.
 */
export const getChildAccount = (euuid: string) =>
  Request<{}>(
    setURL(`${API_ROOT}/account/child-accounts/${encodeURIComponent(euuid)}`),
    setMethod('GET')
  );

/**
 * createChildAccountPersonalAccessToken
 *
 * This endpoint will allow Parent Account Users with the "child_account_access" grant to
 * create an ephemeral token for their proxy user on a child account, using the euuid of
 * that child account. As noted in previous sections, this Token will inherit the
 * permissions of the Proxy User, and the token itself will not be subject to additional
 * restrictions.
 */
export const createChildAccountPersonalAccessToken = (
  euuid: string,
  data: TokenRequest
) =>
  Request<Token>(
    setURL(
      `${API_ROOT}/account/child-accounts/${encodeURIComponent(euuid)}/token`
    ),
    setMethod('POST'),
    setData(data, createPersonalAccessTokenSchema)
  );
