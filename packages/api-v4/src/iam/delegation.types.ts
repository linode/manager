import type { Params } from 'src/types';

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
  params?: Params;
  username: string;
}

export interface GetChildAccountDelegatesParams {
  euuid: string;
  params?: Params;
}

export interface UpdateChildAccountDelegatesParams {
  data: string[];
  euuid: string;
}
