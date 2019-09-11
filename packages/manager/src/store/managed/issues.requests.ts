import * as Bluebird from 'bluebird';
import { getTicket } from 'linode-js-sdk/lib/support';
import { getManagedIssues } from 'src/services/managed';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { ExtendedIssue, requestManagedIssuesActions } from './issues.actions';

const _getAllIssues = getAll<Linode.ManagedIssue>(getManagedIssues);
const getAllIssues = () => _getAllIssues().then(({ data }) => extendIssues(data));

export const extendIssues = async (issues: Linode.ManagedIssue[]) => {
  return await Bluebird.map(issues, thisIssue => {
    /**
     * Get the associated ticket for each issue, since the API response
     * does not include the status or date closed.
     */
    return getTicket(thisIssue.id)
      .then((ticket) => {
        return {
          ...thisIssue,
          status: ticket.status,
          dateClosed: ticket.closed
        } as ExtendedIssue
      })
      // If this fails, we'll just use a normal issue and assume elsewhere the issue is still open.
      .catch(_ => thisIssue as ExtendedIssue)
  })
}

export const requestManagedIssues = createRequestThunk(
  requestManagedIssuesActions,
  getAllIssues
);
