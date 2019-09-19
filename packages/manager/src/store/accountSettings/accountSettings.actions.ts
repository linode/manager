import { AccountSettings } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
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
