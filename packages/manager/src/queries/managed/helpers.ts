import { getTicket } from '@linode/api-v4';
import { DateTime } from 'luxon';

import { parseAPIDate } from 'src/utilities/date';

import type { ExtendedIssue } from './types';
import type { ManagedIssue } from '@linode/api-v4';

export const extendIssues = async (issues: ManagedIssue[]) => {
  /**
   * Issues live forever, but we only care about recent and/or open issues.
   * To avoid pummeling the API for Support tickets for a list of ancient issues,
   * we're doing the filtering here. (The API doesn't allow you to filter on date created.)
   *
   * It might be better to just get the first page of results (page size of ~50), which in almost
   * every case will be enough. Did it this way to be safe.
   */
  const recentIssues = issues.filter(
    (thisIssue) =>
      parseAPIDate(thisIssue.created).diff(DateTime.local()).days < 30
  );

  return Promise.all(
    recentIssues.map((issue) =>
      getTicket(issue.entity.id)
        .then((ticket) => {
          return {
            ...issue,
            dateClosed: ticket.closed,
            status: ticket.status,
          } as ExtendedIssue;
        })
        // If this fails, we'll just use a normal issue
        .catch((_) => issue as ExtendedIssue)
    )
  );
};
