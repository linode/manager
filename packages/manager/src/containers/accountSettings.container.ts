import { AccountSettings } from 'linode-js-sdk/lib/account';
import { connect, MapDispatchToProps } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ApplicationState } from 'src/store';
import { updateSettingsInStore } from 'src/store/accountSettings/accountSettings.actions';
import { requestAccountSettings } from 'src/store/accountSettings/accountSettings.requests';
// import { EntityError } from 'src/store/types';

export interface SettingsProps {
  account?: AccountSettings;
  accountLoading: boolean;
  accountError?: Linode.ApiFieldError[];
  lastUpdated: number;
}

export interface DispatchProps {
  requestAccountSettings: () => Promise<any>;
  updateAccountSettingsInStore: (data: Partial<AccountSettings>) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  requestAccountSettings: () => dispatch(requestAccountSettings()),
  updateAccountSettingsInStore: (data: Partial<AccountSettings>) =>
    dispatch(updateSettingsInStore(data))
});

export default <TInner extends {}, TOuter extends {}>(
  mapAccountToProps: (
    ownProps: TOuter,
    loading: boolean,
    lastUpdated: number,
    accountError?: Linode.ApiFieldError[],
    accountSettings?: AccountSettings
  ) => TInner
) =>
  connect(
    (state: ApplicationState, ownProps: TOuter) => {
      const accountSettings = state.__resources.accountSettings.data;
      const loading = state.__resources.accountSettings.loading;
      const accountError = state.__resources.accountSettings.error;
      const lastUpdated = state.__resources.accountSettings.lastUpdated;

      return mapAccountToProps(
        ownProps,
        loading,
        lastUpdated,
        accountError, // @todo update this to the new entity error pattern.
        accountSettings
      );
    },
    mapDispatchToProps
  );
