import { AccountSettings } from 'linode-js-sdk/lib/account';
import { connect, MapDispatchToProps } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ApplicationState } from 'src/store';
import { updateSettingsInStore } from 'src/store/accountSettings/accountSettings.actions';
import {
  requestAccountSettings,
  updateAccountSettings
} from 'src/store/accountSettings/accountSettings.requests';
import { EntityError } from 'src/store/types';

export interface SettingsProps {
  accountSettings?: AccountSettings;
  accountSettingsLoading: boolean;
  accountSettingsError: EntityError;
  accountSettingsLastUpdated: number;
}

export interface DispatchProps {
  requestAccountSettings: () => Promise<any>;
  updateAccountSettingsInStore: (data: Partial<AccountSettings>) => void;
  updateAccountSettings: (
    data: Partial<AccountSettings>
  ) => Promise<AccountSettings>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  requestAccountSettings: () => dispatch(requestAccountSettings()),
  updateAccountSettingsInStore: (data: Partial<AccountSettings>) =>
    dispatch(updateSettingsInStore(data)),
  updateAccountSettings: (data: Partial<AccountSettings>) =>
    dispatch(updateAccountSettings(data))
});

export default <TInner extends {}, TOuter extends {}>(
  mapAccountToProps?: (
    ownProps: TOuter,
    loading: boolean,
    lastUpdated: number,
    accountError?: EntityError,
    accountSettings?: AccountSettings
  ) => TInner
) =>
  connect(
    (state: ApplicationState, ownProps: TOuter) => {
      const accountSettings = state.__resources.accountSettings.data;
      const accountSettingsLoading = state.__resources.accountSettings.loading;
      const accountSettingsError = state.__resources.accountSettings.error;
      const accountSettingsLastUpdated =
        state.__resources.accountSettings.lastUpdated;

      if (!mapAccountToProps) {
        return {
          ...ownProps,
          accountSettingsLoading,
          accountSettingsLastUpdated,
          accountSettingsError,
          accountSettings
        };
      }
      return mapAccountToProps(
        ownProps,
        accountSettingsLoading,
        accountSettingsLastUpdated,
        accountSettingsError,
        accountSettings
      );
    },
    mapDispatchToProps
  );
