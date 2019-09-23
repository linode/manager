import * as Bluebird from 'bluebird';
import { getTicket } from 'linode-js-sdk/lib/support';
import * as moment from 'moment';
import { getManagedIssues } from 'src/services/managed';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { ExtendedIssue, requestManagedIssuesActions } from './issues.actions';

const _getAllIssues = getAll<Linode.ManagedIssue>(getManagedIssues);
const getAllIssues = () =>
  _getAllIssues().then(({ data }) => extendIssues(data));

export const extendIssues = async (issues: Linode.ManagedIssue[]) => {
  /**
   * Issues live forever, but we only care about recent and/or open issues.
   * To avoid pummeling the API for Support tickets for a list of ancient issues,
   * we're doing the filtering here. (The API doesn't allow you to filter on date created.)
   *
   * It might be better to just get the first page of results (page size of ~50), which in almost
   * every case will be enough. Did it this way to be safe.
   */
  const recentIssues = issues.filter(
    thisIssue => moment(thisIssue.created).diff(moment(), 'days') < 30
  );
  return await Bluebird.map(recentIssues, thisIssue => {
    /**
     * Get the associated ticket for each issue, since the API response
     * does not include the status or date closed.
     */
    return (
      getTicket(thisIssue.id)
        .then(ticket => {
          return {
            ...thisIssue,
            status: ticket.status,
            dateClosed: ticket.closed
          } as ExtendedIssue;
        })
        // If this fails, we'll just use a normal issue
        .catch(_ => thisIssue as ExtendedIssue)
    );
  });
};

export const requestManagedIssues = createRequestThunk(
  requestManagedIssuesActions,
  getAllIssues
);
