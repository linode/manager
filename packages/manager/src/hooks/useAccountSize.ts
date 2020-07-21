import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';

export const useAccountSize = (): boolean => {
  /**
   * Eventually (after ARB-2091 is complete)
   * replace this with something like:
   *
   * return Object.values(accountSize.response.data)
   *   .some(thisEntity => thisEntity > LARGE_ACCOUNT_THRESHOLD)
   */
  return useSelector(
    (state: ApplicationState) =>
      state.preferences.data?.is_large_account ?? false
  );
};

export default useAccountSize;
