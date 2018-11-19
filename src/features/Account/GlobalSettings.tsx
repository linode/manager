import { compose, isEmpty, path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { handleOpen } from 'src/store/reducers/backupDrawer';
import { updateAccountSettings } from 'src/store/reducers/resources/accountSettings';

import AutoBackups from './AutoBackups';
import NetworkHelper from './NetworkHelper';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface StateProps {
  loading: boolean;
  backups_enabled: boolean;
  error?: Error;
  linodesWithoutBackups: Linode.Linode[];
  updateError?: Linode.ApiFieldError[];
  networkHelperEnabled: boolean;
}

interface DispatchProps {
  actions: {
    updateAccount: (data: Partial<Linode.AccountSettings>) => void;
    openBackupsDrawer: () => void;
  }
}

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

class GlobalSettings extends React.Component<CombinedProps, {}> {

  toggleAutomaticBackups = () => {
    const { actions: { updateAccount }, backups_enabled } = this.props;
    return updateAccount({ backups_enabled: !backups_enabled });
  }

  toggleNetworkHelper = () => {
    const { actions: { updateAccount }, networkHelperEnabled } = this.props;
    return updateAccount({ network_helper: !networkHelperEnabled });
  }

  render() {
    const {
      actions: { openBackupsDrawer },
      backups_enabled,
      networkHelperEnabled,
      error,
      loading,
      linodesWithoutBackups,
      updateError
    } = this.props;

    if (loading) { return <CircleProgress /> }
    if (error) { return <ErrorState errorText={"There was an error retrieving your account data."} /> }

    displayError(updateError);

    return (
      <React.Fragment>
        <AutoBackups
          backups_enabled={backups_enabled}
          onChange={this.toggleAutomaticBackups}
          openBackupsDrawer={openBackupsDrawer}
          hasLinodesWithoutBackups={!isEmpty(linodesWithoutBackups)}
        />
        <NetworkHelper
          onChange={this.toggleNetworkHelper}
          networkHelperEnabled={networkHelperEnabled}
        />
      </React.Fragment>
    )
  }
}

const displayError = (errors: Linode.ApiFieldError[] | undefined) => {
  if (!errors) {
    return;
  }
  const errorText = pathOr(
    "There was an error updating your account settings.",
    ['response', 'data', 'errors', 0, 'reason'],
    errors
  );

  return sendToast(errorText, 'error');
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state, ownProps) => ({
  loading: pathOr(false, ['__resources', 'accountSettings', 'loading'], state),
  backups_enabled: pathOr(false, ['__resources', 'accountSettings', 'data', 'backups_enabled'], state),
  error: path(['__resources', 'accountSettings', 'error'], state),
  updateError: path(['__resources', 'accountSettings', 'updateError'], state),
  linodesWithoutBackups: pathOr([], ['backups', 'data'], state),
  networkHelperEnabled: pathOr(false, ['__resources', 'accountSettings', 'data', 'network_helper'], state)
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch, ownProps) => {
  return {
    actions: {
      updateAccount: (data: Partial<Linode.AccountSettings>) => dispatch(updateAccountSettings(data)),
      openBackupsDrawer: () => dispatch(handleOpen())
    }
  };
};

const styled = withStyles(styles, { withTheme: true });

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced: any = compose(
  styled,
  connected
)(GlobalSettings);

export default enhanced;
