import { Account } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';

/**
 * Action Creators
 */
export const actionCreator = actionCreatorFactory(`@@manager/account`);

export const requestAccountActions = actionCreator.async<
  void,
  Account,
  APIError[]
>('request');

// Separate action to update credit card information, since updating this info
// is accomplished with a separate endpoint that doesn't return the new credit
// card info in the response.
export const saveCreditCard = actionCreator<Account['credit_card']>(
  'update-credit-card'
);

export type UpdateAccountParams = Partial<Account>;
export const updateAccountActions = actionCreator.async<
  UpdateAccountParams,
  Account,
  APIError[]
>(`update`);
