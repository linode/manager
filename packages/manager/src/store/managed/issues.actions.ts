import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/managed`);

export const requestManagedIssuesActions = actionCreator.async<
  void,
  Linode.ManagedIssue[],
  Linode.ApiFieldError[]
>('request-issues');
