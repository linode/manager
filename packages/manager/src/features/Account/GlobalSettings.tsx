import { AccountSettings } from 'linode-js-sdk/lib/account';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { isEmpty, path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import TagImportDrawer from 'src/features/TagImport';
import { ApplicationState } from 'src/store';
import { updateAccountSettings } from 'src/store/accountSettings/accountSettings.requests';
import { handleOpen } from 'src/store/backupDrawer';
import getEntitiesWithGroupsToImport, {
  emptyGroupedEntities,
  GroupedEntitiesForImport
} from 'src/store/selectors/getEntitiesWithGroupsToImport';
import { openDrawer as openGroupDrawer } from 'src/store/tagImportDrawer';
import { MapState } from 'src/store/types';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import shouldDisplayGroupImport from 'src/utilities/shouldDisplayGroupImportCTA';
import { storage } from 'src/utilities/storage';
import AutoBackups from './AutoBackups';
import ImportGroupsAsTags from './ImportGroupsAsTags';
import NetworkHelper from './NetworkHelper';

interface StateProps {
  loading: boolean;
  backups_enabled: boolean;
  error?: Error;
  linodesWithoutBackups: Linode.Linode[];
  updateError?: Linode.ApiFieldError[];
  networkHelperEnabled: boolean;
  entitiesWithGroupsToImport: GroupedEntitiesForImport;
  isManaged: boolean;
}

interface DispatchProps {
  actions: {
    updateAccount: (data: Partial<AccountSettings>) => void;
    openImportDrawer: () => void;
    openBackupsDrawer: () => void;
  };
}

type CombinedProps = StateProps & DispatchProps & WithSnackbarProps;

class GlobalSettings extends React.Component<CombinedProps, {}> {
  toggleAutomaticBackups = () => {
    const {
      actions: { updateAccount },
      backups_enabled
    } = this.props;
    return updateAccount({ backups_enabled: !backups_enabled });
  };

  toggleNetworkHelper = () => {
    const {
      actions: { updateAccount },
      networkHelperEnabled
    } = this.props;
    return updateAccount({ network_helper: !networkHelperEnabled });
  };

  displayError = (errors: Linode.ApiFieldError[] | undefined) => {
    if (!errors) {
      return;
    }
    const errorText = getErrorStringOrDefault(
      errors,
      'There was an error updating your account settings.'
    );

    return this.props.enqueueSnackbar(errorText, {
      variant: 'error'
    });
  };

  render() {
    const {
      actions: { openBackupsDrawer, openImportDrawer },
      backups_enabled,
      networkHelperEnabled,
      error,
      loading,
      linodesWithoutBackups,
      updateError,
      entitiesWithGroupsToImport,
      isManaged
    } = this.props;

    if (loading) {
      return <CircleProgress />;
    }
    if (error) {
      return (
        <ErrorState
          errorText={'There was an error retrieving your account data.'}
        />
      );
    }

    this.displayError(updateError);

    return (
      <React.Fragment>
        <AutoBackups
          isManagedCustomer={isManaged}
          backups_enabled={backups_enabled}
          onChange={this.toggleAutomaticBackups}
          openBackupsDrawer={openBackupsDrawer}
          hasLinodesWithoutBackups={!isEmpty(linodesWithoutBackups)}
        />
        <NetworkHelper
          onChange={this.toggleNetworkHelper}
          networkHelperEnabled={networkHelperEnabled}
        />
        {shouldDisplayGroupImport(entitiesWithGroupsToImport) && (
          <ImportGroupsAsTags openDrawer={openImportDrawer} />
        )}
        <TagImportDrawer />
      </React.Fragment>
    );
  }
}
const mapStateToProps: MapState<StateProps, {}> = state => ({
  loading: pathOr(false, ['__resources', 'accountSettings', 'loading'], state),
  backups_enabled: pathOr(
    false,
    ['__resources', 'accountSettings', 'data', 'backups_enabled'],
    state
  ),
  error: path(['__resources', 'accountSettings', 'error'], state),
  updateError: path(['__resources', 'accountSettings', 'updateError'], state),
  linodesWithoutBackups: state.__resources.linodes.entities.filter(
    l => !l.backups.enabled
  ),
  networkHelperEnabled: pathOr(
    false,
    ['__resources', 'accountSettings', 'data', 'network_helper'],
    state
  ),
  entitiesWithGroupsToImport: !storage.hasImportedGroups.get()
    ? getEntitiesWithGroupsToImport(state)
    : emptyGroupedEntities,
  isManaged: pathOr(
    false,
    ['__resources', 'accountSettings', 'data', 'managed'],
    state
  )
});
const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => {
  return {
    actions: {
      updateAccount: (data: Partial<AccountSettings>) =>
        dispatch(updateAccountSettings(data)),
      openBackupsDrawer: () => dispatch(handleOpen()),
      openImportDrawer: () => dispatch(openGroupDrawer())
    }
  };
};

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

const enhanced = compose<CombinedProps, {}>(
  connected,
  withSnackbar
)(GlobalSettings);

export default enhanced;
