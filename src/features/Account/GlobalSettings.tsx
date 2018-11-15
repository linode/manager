import { compose, isEmpty, path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import { handleOpen } from 'src/store/reducers/backupDrawer';
import { updateAccountSettings } from 'src/store/reducers/resources/accountSettings';

import AutoBackups from './AutoBackups';

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
}

interface DispatchProps {
  actions: {
    updateAccount: (data: Partial<Linode.AccountSettings>) => void;
    openBackupsDrawer: () => void;
  }
}

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

class GlobalSettings extends React.Component<CombinedProps,{}> {

  handleToggle = () => {
    const { actions: { updateAccount }, backups_enabled } = this.props;
    updateAccount({ backups_enabled: !backups_enabled });
  }

  render() {
    const {
      actions: { openBackupsDrawer },
      backups_enabled,
      error,
      loading,
      linodesWithoutBackups,
      updateError
    } = this.props;

    if (loading) { return <CircleProgress /> }
    if (error) { return <ErrorState errorText={"There was an error retrieving your account data."} /> }

    return(
      <AutoBackups
        backups_enabled={backups_enabled}
        errors={updateError}
        handleToggle={this.handleToggle}
        openBackupsDrawer={openBackupsDrawer}
        hasLinodesWithoutBackups={!isEmpty(linodesWithoutBackups)}
      />
    )
  }
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state, ownProps) => ({
  loading: pathOr(false, ['__resources', 'accountSettings','loading'], state),
  backups_enabled: pathOr(false, ['__resources', 'accountSettings', 'data', 'backups_enabled'], state),
  error: path(['__resources', 'accountSettings','error'], state),
  updateError: path(['__resources', 'accountSettings','updateError'], state),
  linodesWithoutBackups: pathOr([], ['backups', 'data'], state)
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
