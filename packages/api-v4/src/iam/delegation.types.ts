import type { Params } from 'src/types';

export interface ChildAccount {
  company: string;
  euuid: string;
}

type ParamsWithDelegates = Params & { includeDelegates?: boolean };
export interface ListChildAccountsParams {
  params?: ParamsWithDelegates;
}

export interface ChildAccountWithDelegates extends ChildAccount {
  users: string[];
}

export interface ListMyDelegatedChildAccountsParams {
  params?: Params;
}

export interface ListDelegatedChildAccountsForUserParams {
  params?: Params;
  username: string;
}

export interface ListChildAccountDelegatesParams {
  euuid: string;
  params?: Params;
}

export interface UpdateChildAccountDelegatesParams {
  data: string[];
  euuid: string;
}
