import { LARGE_ACCOUNT_THRESHOLD } from 'src/constants';
import { getDomainsPage } from '../domains/domains.requests';
import { getLinodesPage } from '../linodes/linode.requests';
import { setLargeAccount } from './accountManagement.actions';
import { ThunkActionCreator, ThunkDispatch } from '../types';

export const checkAccountSize: ThunkActionCreator<Promise<null>> = () => async (
  dispatch: ThunkDispatch
) => {
  /**
   * getDomainsPage will automatically check if this is a "full request"
   * (that is, if the total number of Domains matches the number of Domains
   * on the account). If so, it will bump lastUpdated and store the info in
   * Redux.
   */
  return Promise.all([
    dispatch(getDomainsPage({ params: { page_size: 100 } })),
    dispatch(getLinodesPage({ params: { page_size: 100 } }))
  ])
    .then(combinedResults => {
      dispatch(
        setLargeAccount(
          combinedResults.some(
            thisResult => thisResult.results > LARGE_ACCOUNT_THRESHOLD
          )
        )
      );

      return null;
    })
    .catch(_ => null);
};
