import type { Filter, Params } from 'src/types';

export interface ChildAccount {
  company: string;
  euuid: string;
}

export interface GetChildAccountsIamParams {
  params?: Params;
  users?: boolean;
}

export interface ChildAccountWithDelegates extends ChildAccount {
  users: string[];
}

export interface GetMyDelegatedChildAccountsParams {
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
