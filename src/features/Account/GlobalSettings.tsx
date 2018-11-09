import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
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
}

interface DispatchProps {
  actions: {
    updateAccount: (data: Partial<Linode.AccountSettings>) => void;
  }
}

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

class GlobalSettings extends React.Component<CombinedProps,{}> {

  handleToggle = () => {
    const { actions: { updateAccount }, backups_enabled } = this.props;
    updateAccount({ backups_enabled: !backups_enabled });
  }

  render() {
    const { backups_enabled, error, loading } = this.props;

    if (loading) { return <CircleProgress /> }
    if (error) { return <ErrorState errorText={"There was an error retrieving your account data."} /> }

    return(
      <AutoBackups
        backups_enabled={backups_enabled}
        error={error}
        handleToggle={this.handleToggle}
      />
    )
  }
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state, ownProps) => ({
  loading: pathOr(false, ['__resources', 'accountSettings','loading'], state),
  backups_enabled: pathOr(false, ['__resources', 'accountSettings', 'data', 'backups_enabled'], state),
  error: pathOr(undefined, ['__resources', 'accountSettings','error'], state)
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch, ownProps) => {
  return {
    actions: {
      updateAccount: (data: Partial<Linode.AccountSettings>) => dispatch(updateAccountSettings(data)),
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
