import { AccountSettings } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/account/settings`);

export const requestAccountSettingsActions = actionCreator.async<
  void,
  AccountSettings,
  APIError[]
>('request');

export const updateAccountSettingsActions = actionCreator.async<
  Partial<AccountSettings>,
  AccountSettings,
  APIError[]
>('update');

export const updateSettingsInStore = actionCreator<Partial<AccountSettings>>(
  'update-store'
);
