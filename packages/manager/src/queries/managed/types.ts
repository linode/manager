import { ManagedIssue } from '@linode/api-v4/lib/managed/types';

export interface ExtendedIssue extends ManagedIssue {
  status?: 'open' | 'closed' | 'new';
  dateClosed?: string;
}
