import { connect, MapDispatchToProps } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ApplicationState } from 'src/store';
import { requestAccount } from 'src/store/account/account.requests';

export interface AccountProps {
  account?: Linode.Account;
  accountLoading: boolean;
  accountError?: Linode.ApiFieldError[] | Error;
}

export interface DispatchProps {
  requestAccount: () => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  requestAccount: () => dispatch(requestAccount())
});

export default <TInner extends {}, TOuter extends {}>(
  mapAccountToProps: (
    ownProps: TOuter,
    accountLoading: boolean,
    account?: Linode.Account,
    accountError?: Linode.ApiFieldError[] | Error
  ) => TInner
) =>
  connect(
    (state: ApplicationState, ownProps: TOuter) => {
      const account = state.__resources.account.data;
      const accountLoading = state.__resources.account.loading;
      const accountError = state.__resources.account.error;

      return mapAccountToProps(ownProps, accountLoading, account, accountError);
    },
    mapDispatchToProps
  );
