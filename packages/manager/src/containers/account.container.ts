import { Account } from '@linode/api-v4/lib/account';
import { connect, InferableComponentEnhancerWithProps } from 'react-redux';
import { ApplicationState } from 'src/store';
import { saveCreditCard } from 'src/store/account/account.actions';
import { State } from 'src/store/account/account.reducer';
import {
  requestAccount,
  updateAccount,
} from 'src/store/account/account.requests';
import { ThunkDispatch } from 'src/store/types';

export interface StateProps {
  accountData: State['data'];
  accountLoading: State['loading'];
  accountError: State['error'];
  accountLastUpdated: State['lastUpdated'];
}

export interface DispatchProps {
  requestAccount: () => void;
  updateAccount: (data: Partial<Account>) => Promise<any>;
  saveCreditCard: (data: Account['credit_card']) => void;
}

type MapProps<ReduxStateProps, OwnProps> = (
  ownProps: OwnProps,
  data: StateProps
) => ReduxStateProps & Partial<StateProps>;

export type Props = DispatchProps & StateProps;

interface Connected {
  <ReduxStateProps, OwnProps>(
    mapStateToProps: MapProps<ReduxStateProps, OwnProps>
  ): InferableComponentEnhancerWithProps<
    ReduxStateProps & Partial<StateProps> & DispatchProps & OwnProps,
    OwnProps
  >;
  <ReduxStateProps, OwnProps>(): InferableComponentEnhancerWithProps<
    ReduxStateProps & DispatchProps & OwnProps,
    OwnProps
  >;
}

const connected: Connected = <ReduxState extends {}, OwnProps extends {}>(
  mapStateToProps?: MapProps<ReduxState, OwnProps>
) =>
  connect<
    (ReduxState & Partial<StateProps>) | StateProps,
    DispatchProps,
    OwnProps,
    ApplicationState
  >(
    (state, ownProps) => {
      const { loading, error, data, lastUpdated } = state.__resources.account;

      const result = {
        accountData: data,
        accountError: error,
        accountLastUpdated: lastUpdated,
        accountLoading: loading,
      };

      return !!mapStateToProps ? mapStateToProps(ownProps, result) : result;
    },
    (dispatch: ThunkDispatch) => ({
      requestAccount: () => dispatch(requestAccount()),
      updateAccount: data => dispatch(updateAccount(data)),
      saveCreditCard: data => dispatch(saveCreditCard(data)),
    })
  );

export default connected;
