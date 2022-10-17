import Bluebird from 'bluebird';
import { DateTime } from 'luxon';
import { parseAPIDate } from 'src/utilities/date';
import { ExtendedIssue } from './types';
import { ManagedIssue, getTicket } from '@linode/api-v4';

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
  return await Bluebird.map(recentIssues, (thisIssue) => {
    /**
     * Get the associated ticket for each issue, since the API response
     * does not include the status or date closed.
     */
    return (
      getTicket(thisIssue.entity.id)
        .then((ticket) => {
          return {
            ...thisIssue,
            status: ticket.status,
            dateClosed: ticket.closed,
          } as ExtendedIssue;
        })
        // If this fails, we'll just use a normal issue
        .catch((_) => thisIssue as ExtendedIssue)
    );
  });
};
