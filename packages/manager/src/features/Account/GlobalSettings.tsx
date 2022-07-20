import { Linode } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { isEmpty } from 'ramda';
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
import {
  useAccountSettings,
  useMutateAccountSettings,
} from 'src/queries/accountSettings';

interface StateProps {
  linodesWithoutBackups: Linode[];
  entitiesWithGroupsToImport: GroupedEntitiesForImport;
}

interface DispatchProps {
  actions: {
    openImportDrawer: () => void;
    openBackupsDrawer: () => void;
  };
}

type CombinedProps = StateProps &
  DispatchProps &
  WithSnackbarProps &
  RouteComponentProps<{}>;

const GlobalSettings: React.FC<CombinedProps> = (props) => {
  const {
    actions: { openBackupsDrawer, openImportDrawer },
    linodesWithoutBackups,
    entitiesWithGroupsToImport,
  } = props;

  const {
    data: accountSettings,
    isLoading: accountSettingsLoading,
    error: accountSettingsError,
  } = useAccountSettings();

  const { mutateAsync: updateAccount } = useMutateAccountSettings();

  const { _loading } = useReduxLoad(['linodes']);

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

  if (accountSettingsLoading || _loading) {
    return <CircleProgress />;
  }
  if (accountSettingsError) {
    return (
      <ErrorState
        errorText={'There was an error retrieving your account data.'}
      />
    );
  }

  if (!accountSettings) {
    return null;
  }

  const {
    backups_enabled,
    managed,
    network_helper,
    object_storage,
  } = accountSettings;

  const toggleAutomaticBackups = () => {
    updateAccount({ backups_enabled: !backups_enabled }).catch(displayError);
  };

  const toggleNetworkHelper = () => {
    updateAccount({ network_helper: !network_helper }).catch(displayError);
  };

  return (
    <div>
      <AutoBackups
        isManagedCustomer={managed}
        backups_enabled={backups_enabled}
        onChange={toggleAutomaticBackups}
        openBackupsDrawer={openBackupsDrawer}
        hasLinodesWithoutBackups={!isEmpty(linodesWithoutBackups)}
      />
      <NetworkHelper
        onChange={toggleNetworkHelper}
        networkHelperEnabled={network_helper}
      />
      <EnableObjectStorage object_storage={object_storage} />
      <EnableManaged isManaged={managed} />
      {shouldDisplayGroupImport(entitiesWithGroupsToImport) && (
        <ImportGroupsAsTags openDrawer={openImportDrawer} />
      )}
      <CloseAccountSetting />

      <TagImportDrawer />
    </div>
  );
};
const mapStateToProps: MapState<StateProps, {}> = (state) => ({
  linodesWithoutBackups: getLinodesWithoutBackups(state.__resources),
  entitiesWithGroupsToImport: getEntitiesWithGroupsToImport(state),
});
const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => {
  return {
    actions: {
      openBackupsDrawer: () => dispatch(handleOpen()),
      openImportDrawer: () => dispatch(openGroupDrawer()),
    },
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, {}>(
  connected,
  withSnackbar
)(GlobalSettings);

export default enhanced;
