import type { Filter, Params, RequestOptions } from '../types';

export interface ChildAccount {
  company: string;
  euuid: string;
}

export interface GetChildAccountsIamParams {
  enabled?: boolean;
  filter?: Filter;
  params?: Params;
  users?: boolean;
}

export interface ChildAccountWithDelegates extends ChildAccount {
  users: string[];
}

export interface GetMyDelegatedChildAccountsParams {
  filter?: Filter;
  params?: Params;
}

export interface GetDelegatedChildAccountsForUserParams {
  enabled?: boolean;
  filter?: Filter;
  params?: Params;
  username: string;
}

export interface GetChildAccountDelegatesParams {
  euuid: string;
  params?: Params;
}

export interface UpdateChildAccountDelegatesParams {
  euuid: string;
  users: string[];
}

export interface ChildAccountTokenPayload extends RequestOptions {
  euuid: string;
}
