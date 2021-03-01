import { Account } from '@linode/api-v4/lib/account/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/account/account.reducer';
import {
  requestAccount as _request,
  updateAccount as _update,
} from 'src/store/account/account.requests';
import { Dispatch } from './types';

export interface AccountProps {
  account: State;
  requestAccount: () => Promise<Account>;
  updateAccount: (payload: Partial<Account>) => Promise<Account>;
}

export const useAccount = () => {
  const dispatch: Dispatch = useDispatch();
  const account = useSelector(
    (state: ApplicationState) => state.__resources.account
  );
  const requestAccount = () => dispatch(_request());
  const updateAccount = (payload: Partial<Account>) =>
    dispatch(_update(payload));

  return { account, requestAccount, updateAccount };
};

export default useAccount;
