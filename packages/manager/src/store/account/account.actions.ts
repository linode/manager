import { Account } from 'linode-js-sdk/lib/account'
import { actionCreatorFactory } from 'typescript-fsa';

/**
 * Action Creators
 */
export const actionCreator = actionCreatorFactory(`@@manager/account`);

export const profileRequest = actionCreator('request');

export const profileRequestSuccess = actionCreator<Account>('success');

export const profileRequestFail = actionCreator<Linode.ApiFieldError[]>('fail');

export type UpdateAccountParams = Partial<Account>;
export const updateAccountActions = actionCreator.async<
  UpdateAccountParams,
  Account,
  Linode.ApiFieldError[]
>(`update`);
