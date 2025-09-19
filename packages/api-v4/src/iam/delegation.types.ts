export interface ChildAccount {
  company: string;
  euuid: string;
}

export interface ChildAccountWithUsers extends ChildAccount {
  users: string[];
}
