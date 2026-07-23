import { UpdateAccountSettingsSchema } from '@linode/validation/lib/account.schema';

import { BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type {
  AccountSettings,
  TfaOptionalUser,
  UpdateTfaOptionalUsersPayload,
  UpdateTfaOptionalUsersResponse,
} from './types';

export const getTfaEnforcementAccountSettings = () =>
  Request<AccountSettings>(
    setURL(`${BETA_API_ROOT}/account/settings`),
    setMethod('GET'),
  );

export const updateTfaEnforcementAccountSettings = (
  data: Partial<AccountSettings>,
) =>
  Request<AccountSettings>(
    setURL(`${BETA_API_ROOT}/account/settings`),
    setMethod('PUT'),
    setData(data, UpdateAccountSettingsSchema),
  );

export const getTfaOptionalUsers = (params?: Params, filter?: Filter) =>
  Request<Page<TfaOptionalUser>>(
    setURL(`${BETA_API_ROOT}/account/tfa-optional-users`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

export const updateTfaOptionalUsers = (data: UpdateTfaOptionalUsersPayload) =>
  Request<UpdateTfaOptionalUsersResponse>(
    setURL(`${BETA_API_ROOT}/account/tfa-optional-users`),
    setMethod('PUT'),
    setData(data),
  );
