import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';


import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import Toggle from 'src/components/Toggle';
import { updateAccountSettings } from 'src/store/reducers/resources/accountSettings';


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

interface State {
  toggled: boolean;
}

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

class AutoBackups extends React.Component<CombinedProps, State> {
  state: State = {
    toggled: this.props.backups_enabled || false,
  };

  toggle = () => {
    const { toggled } = this.state;
    this.setState({ toggled: !toggled});
  }

  handleSubmit = () => {
    const { toggled } = this.state;
    const { updateAccount } = this.props.actions;
    updateAccount({ backups_enabled: toggled })
  }

  renderActions = () => {
    const { loading } = this.props;
    return (
      <ActionsPanel>
        <Button type="primary" onClick={this.handleSubmit} loading={loading}>Save</Button>
      </ActionsPanel>
    );
  };

  render() {
    const { toggled } = this.state;
    return (
      <React.Fragment>
        <ExpansionPanel
          heading="Backup Auto Enrollment"
          actions={this.renderActions}
        >
          <Grid container direction="column">
            <Grid item>
              <Typography variant="title">
                Back Up All New Linodes
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1">
                This controls whether Linode Backups are enabled, by default, for all Linodes when
                they are initially created. For each Linode with Backups enabled, your account will
                be billed the additional hourly rate noted on the
                <a href="https://linode.com/backups">{` Backups pricing page`}</a>.
              </Typography>
            </Grid>
            <Grid item container direction="row" alignItems="center">
              <Grid item>
                <Toggle
                  onChange={this.toggle}
                  checked={toggled}
                />
              </Grid>
              <Grid item>
              <Typography variant="body1">
                {toggled
                  ? "Auto Enroll All New Linodes in Backups"
                  : "Don't Enroll New Linodes in Backups Automatically"
                }
              </Typography>
              </Grid>
            </Grid>
            <Grid item>
              <Typography variant="body1">
                For existing Linodes without backups, <a>enable now</a>.
              </Typography>
            </Grid>
          </Grid>
        </ExpansionPanel>
      </React.Fragment>
    );
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
)(AutoBackups)

export default enhanced;
