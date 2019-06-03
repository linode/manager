import { connect, MapDispatchToProps } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ApplicationState } from 'src/store';
import {
  requestAccount,
  updateAccount
} from 'src/store/account/account.requests';
import { EntityError } from 'src/store/types';

export interface AccountProps {
  account?: Linode.Account;
  accountLoading: boolean;
  accountError: EntityError;
  lastUpdated?: number;
}

export interface DispatchProps {
  requestAccount: () => void;
  updateAccount: (data: Partial<Linode.Account>) => Promise<any>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  requestAccount: () => dispatch(requestAccount()),
  updateAccount: (data: Partial<Linode.Account>) =>
    dispatch(updateAccount(data))
});

export default <TInner extends {}, TOuter extends {}>(
  mapAccountToProps: (
    ownProps: TOuter,
    accountLoading: boolean,
    lastUpdated: number,
    accountError: EntityError,
    account?: Linode.Account,
  ) => TInner
) =>
  connect(
    (state: ApplicationState, ownProps: TOuter) => {
      const account = state.__resources.account.data;
      const accountLoading = state.__resources.account.loading;
      const accountError = state.__resources.account.error;
      const lastUpdated = state.__resources.account.lastUpdated;

      return mapAccountToProps(
        ownProps,
        accountLoading,
        lastUpdated,
        accountError,
        account,
      );
    },
    mapDispatchToProps
  );
