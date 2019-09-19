import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/managed`);

export interface ExtendedIssue extends Linode.ManagedIssue {
  status?: 'open' | 'closed' | 'new';
  dateClosed?: string;
}

export const requestManagedIssuesActions = actionCreator.async<
  void,
  ExtendedIssue[],
  Linode.ApiFieldError[]
>('request-issues');
