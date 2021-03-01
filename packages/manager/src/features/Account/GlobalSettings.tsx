import { AccountSettings } from '@linode/api-v4/lib/account';
import { Linode } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { isEmpty, path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import TagImportDrawer from 'src/features/TagImport';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { ApplicationState } from 'src/store';
import { updateSettingsInStore } from 'src/store/accountSettings/accountSettings.actions';
import {
  requestAccountSettings,
  updateAccountSettings,
} from 'src/store/accountSettings/accountSettings.requests';
import { handleOpen } from 'src/store/backupDrawer';
import getEntitiesWithGroupsToImport, {
  GroupedEntitiesForImport,
} from 'src/store/selectors/getEntitiesWithGroupsToImport';
import { getLinodesWithoutBackups } from 'src/store/selectors/getLinodesWithBackups';
import { openDrawer as openGroupDrawer } from 'src/store/tagImportDrawer';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import shouldDisplayGroupImport from 'src/utilities/shouldDisplayGroupImportCTA';
import AutoBackups from './AutoBackups';
import EnableManaged from './EnableManaged';
import EnableObjectStorage from './EnableObjectStorage';
import ImportGroupsAsTags from './ImportGroupsAsTags';
import NetworkHelper from './NetworkHelper';
import CloseAccountSetting from './CloseAccountSetting';

interface StateProps {
  loading: boolean;
  backups_enabled: boolean;
  error?: Error;
  linodesWithoutBackups: Linode[];
  updateError?: APIError[];
  networkHelperEnabled: boolean;
  entitiesWithGroupsToImport: GroupedEntitiesForImport;
  isManaged: boolean;
  object_storage: AccountSettings['object_storage'];
}

interface DispatchProps {
  actions: {
    updateAccount: (data: Partial<AccountSettings>) => Promise<AccountSettings>;
    updateAccountSettingsInStore: (data: Partial<AccountSettings>) => void;
    openImportDrawer: () => void;
    openBackupsDrawer: () => void;
    requestSettings: () => Promise<AccountSettings>;
  };
}

type CombinedProps = StateProps &
  DispatchProps &
  WithSnackbarProps &
  RouteComponentProps<{}>;

const GlobalSettings: React.FC<CombinedProps> = (props) => {
  const {
    actions: { openBackupsDrawer, openImportDrawer, updateAccount },
    backups_enabled,
    networkHelperEnabled,
    error,
    loading,
    linodesWithoutBackups,
    entitiesWithGroupsToImport,
    isManaged,
    object_storage,
  } = props;

  const { _loading } = useReduxLoad(['accountSettings', 'domains', 'linodes']);

  const toggleAutomaticBackups = () => {
    return updateAccount({ backups_enabled: !backups_enabled }).catch(
      displayError
    );
  };

  const toggleNetworkHelper = () => {
    return updateAccount({ network_helper: !networkHelperEnabled }).catch(
      displayError
    );
  };

  const displayError = (errors: APIError[] | undefined) => {
    if (!errors) {
      return;
    }
    const errorText = getAPIErrorOrDefault(
      errors,
      'There was an error updating your account settings.'
    )[0].reason;

    return props.enqueueSnackbar(errorText, {
      variant: 'error',
    });
  };

  if (loading || _loading) {
    return <CircleProgress />;
  }
  if (error) {
    return (
      <ErrorState
        errorText={'There was an error retrieving your account data.'}
      />
    );
  }

  return (
    <div>
      <AutoBackups
        isManagedCustomer={isManaged}
        backups_enabled={backups_enabled}
        onChange={toggleAutomaticBackups}
        openBackupsDrawer={openBackupsDrawer}
        hasLinodesWithoutBackups={!isEmpty(linodesWithoutBackups)}
      />
      <NetworkHelper
        onChange={toggleNetworkHelper}
        networkHelperEnabled={networkHelperEnabled}
      />
      <EnableObjectStorage
        object_storage={object_storage}
        update={props.actions.updateAccountSettingsInStore}
      />
      <EnableManaged
        isManaged={isManaged}
        update={props.actions.updateAccountSettingsInStore}
      />
      {shouldDisplayGroupImport(entitiesWithGroupsToImport) && (
        <ImportGroupsAsTags openDrawer={openImportDrawer} />
      )}
      <CloseAccountSetting />

      <TagImportDrawer />
    </div>
  );
};
const mapStateToProps: MapState<StateProps, {}> = (state) => ({
  loading: pathOr(false, ['__resources', 'accountSettings', 'loading'], state),

  backups_enabled: pathOr(
    false,
    ['__resources', 'accountSettings', 'data', 'backups_enabled'],
    state
  ),
  error: path(['__resources', 'accountSettings', 'error', 'read'], state),
  updateError: path(
    ['__resources', 'accountSettings', 'error', 'update'],
    state
  ),
  linodesWithoutBackups: getLinodesWithoutBackups(state.__resources),
  networkHelperEnabled: pathOr(
    false,
    ['__resources', 'accountSettings', 'data', 'network_helper'],
    state
  ),
  entitiesWithGroupsToImport: getEntitiesWithGroupsToImport(state),
  isManaged: pathOr(
    false,
    ['__resources', 'accountSettings', 'data', 'managed'],
    state
  ),
  object_storage: pathOr(
    'disabled',
    ['__resources', 'accountSettings', 'data', 'object_storage'],
    state
  ),
});
const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => {
  return {
    actions: {
      updateAccount: (data: Partial<AccountSettings>) =>
        dispatch(updateAccountSettings(data)),
      openBackupsDrawer: () => dispatch(handleOpen()),
      openImportDrawer: () => dispatch(openGroupDrawer()),
      updateAccountSettingsInStore: (data: Partial<AccountSettings>) =>
        dispatch(updateSettingsInStore(data)),
      requestSettings: () => dispatch(requestAccountSettings()),
    },
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, {}>(
  connected,
  withSnackbar
)(GlobalSettings);

export default enhanced;
