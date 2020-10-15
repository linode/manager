import { LARGE_ACCOUNT_THRESHOLD } from 'src/constants';
import { getDomainsPage } from '../domains/domains.requests';
import { setLargeAccount } from './accountManagement.actions';
import { ThunkActionCreator, ThunkDispatch } from '../types';

export const checkAccountSize: ThunkActionCreator<Promise<null>> = () => (
  dispatch: ThunkDispatch
) => {
  /**
   * getDomainsPage will automatically check if this is a "full request"
   * (that is, if the total number of Domains matches the number of Domains
   * on the account). If so, it will bump lastUpdated and store the info in
   * Redux.
   */
  return (
    dispatch(getDomainsPage({ params: { page_size: 100 } }))
      .then(result => {
        const { results } = result;
        dispatch(setLargeAccount(results > LARGE_ACCOUNT_THRESHOLD));
        return null;
      })
      // We default the state to false, which gives the intended default behavior for the app.
      // No need to do anything special here.
      .catch(_ => null)
  );
};
