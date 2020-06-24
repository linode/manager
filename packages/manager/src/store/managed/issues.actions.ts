import { ManagedIssue } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import actionCreatorFactory from 'typescript-fsa';
import { GetAllData } from 'src/utilities/getAll';

export const actionCreator = actionCreatorFactory(`@@manager/managed`);

export interface ExtendedIssue extends ManagedIssue {
  status?: 'open' | 'closed' | 'new';
  dateClosed?: string;
}

export const requestManagedIssuesActions = actionCreator.async<
  void,
  GetAllData<ExtendedIssue>,
  APIError[]
>('request-issues');
