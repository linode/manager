import { actionCreatorFactory } from 'typescript-fsa';

/**
 * Action Creators
 */
export const actionCreator = actionCreatorFactory(`@@manager/account`);

export const profileRequest = actionCreator('request');

export const profileRequestSuccess = actionCreator<Linode.Account>('success');

export const profileRequestFail = actionCreator<Linode.ApiFieldError[]>('fail');
