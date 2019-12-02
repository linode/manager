import { AccountSettings } from 'linode-js-sdk/lib/account';
import { connect, InferableComponentEnhancerWithProps } from 'react-redux';
import { ApplicationState } from 'src/store';
import { updateSettingsInStore } from 'src/store/accountSettings/accountSettings.actions';
import { State } from 'src/store/accountSettings/accountSettings.reducer';
import {
  requestAccountSettings,
  updateAccountSettings
} from 'src/store/accountSettings/accountSettings.requests';
import { ThunkDispatch } from 'src/store/types';

export interface DispatchProps {
  requestAccountSettings: () => Promise<any>;
  updateAccountSettingsInStore: (data: Partial<AccountSettings>) => void;
  updateAccountSettings: (
    data: Partial<AccountSettings>
  ) => Promise<AccountSettings>;
}

export interface StateProps {
  accountSettings?: State['data'];
  accountSettingsLoading: State['loading'];
  accountSettingsError?: State['error'];
  accountSettingsLastUpdated: State['lastUpdated'];
}

type MapProps<ReduxStateProps, OwnProps> = (
  ownProps: OwnProps,
  loading: State['loading'],
  lastUpdated: State['lastUpdated'],
  error: State['error'],
  data: State['data']
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
      const {
        loading: accountSettingsLoading,
        error: accountSettingsError,
        data: accountSettings,
        lastUpdated: accountSettingsLastUpdated
      } = state.__resources.accountSettings;

      if (mapStateToProps) {
        return mapStateToProps(
          ownProps,
          accountSettingsLoading,
          accountSettingsLastUpdated,
          accountSettingsError,
          accountSettings
        );
      }

      return {
        accountSettings,
        accountSettingsError,
        accountSettingsLastUpdated,
        accountSettingsLoading
      };
    },
    (dispatch: ThunkDispatch) => ({
      requestAccountSettings: () => dispatch(requestAccountSettings()),
      updateAccountSettings: data => dispatch(updateAccountSettings(data)),
      updateAccountSettingsInStore: data =>
        dispatch(updateSettingsInStore(data))
    })
  );

export default connected;
