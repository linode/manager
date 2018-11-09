import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';


import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';
import { updateAccountSettings } from 'src/store/reducers/resources/accountSettings';


type ClassNames = 'root' | 'footnote';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  footnote: {
    fontSize: 14,
  },
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

const AutoBackups: React.StatelessComponent<CombinedProps> = (props) => {

  const { backups_enabled, classes, error } = props;

  const toggle = () => {
    const { updateAccount } = props.actions;
    updateAccount({ backups_enabled: !backups_enabled })
  }

  return (
    <React.Fragment>
      <ExpansionPanel
        heading="Backup Auto Enrollment"
      >
        <Grid container direction="column" className={classes.root}>
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
          {error &&
            <Grid item>
              <Notice error text="There was an error updating your account settings." />
            </Grid>
          }
          <Grid item container direction="row" alignItems="center">
            <Grid item>
              <Toggle
                onChange={toggle}
                checked={backups_enabled}
              />
            </Grid>
            <Grid item>
            <Typography variant="body1">
              {backups_enabled
                ? "Auto Enroll All New Linodes in Backups"
                : "Don't Enroll New Linodes in Backups Automatically"
              }
            </Typography>
            </Grid>
          </Grid>
          {/* Uncomment after BackupDrawer is merged */}
          {/* <Grid item>
            <Typography variant="body1" className={classes.footnote}>
              For existing Linodes without backups, <a>enable now</a>.
            </Typography>
          </Grid> */}
        </Grid>
      </ExpansionPanel>
    </React.Fragment>
  );
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
)(AutoBackups);

export default enhanced;
