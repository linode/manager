import type { ManagedIssue } from '@linode/api-v4/lib/managed/types';

export interface ExtendedIssue extends ManagedIssue {
  dateClosed?: string;
  status?: 'closed' | 'new' | 'open';
}
