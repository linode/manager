export interface ChildAccount {
  company: string;
  euuid: string;
}

export interface ChildAccountWithDelegates extends ChildAccount {
  users: string[];
}
