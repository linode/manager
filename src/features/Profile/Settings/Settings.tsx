import { WithStyles } from '@material-ui/core/styles';
import { path } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Toggle from 'src/components/Toggle';
import { updateProfile } from 'src/services/profile';
import { handleUpdate } from 'src/store/profile/profile.actions';
import { MapState } from 'src/store/types';

type ClassNames = 'root' | 'title' | 'label';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
      marginTop: theme.spacing(2)
    },
    title: {
      marginBottom: theme.spacing(2)
    },
    label: {
      marginLeft: theme.spacing(1)
    }
  });

interface State {
  submitting: boolean;
}

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

class ProfileSettings extends React.Component<CombinedProps, State> {
  state: State = {
    submitting: false
  };

  render() {
    const { classes, status } = this.props;

    return (
      <Paper className={classes.root}>
        <DocumentTitleSegment segment="Settings" />
        <Typography variant="h2" className={classes.title}>
          Notifications
        </Typography>
        <Grid container alignItems="center">
          <Grid item xs={12}>
            <FormControlLabel
              className="toggleLassie"
              control={<Toggle onChange={this.toggle} checked={status} />}
              label={`
                Email alerts for account activity are ${
                status === true ? 'enabled' : 'disabled'
                }
              `}
              disabled={this.state.submitting}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  }

  toggle = () => {
    this.setState({ submitting: true });

    updateProfile({ email_notifications: !this.props.status })
      .then(profile => {
        this.props.actions.updateProfile(profile);
        this.setState({ submitting: false });
      })
      .catch(() => {
        /* Couldnt really imagine this being an issue... 1*/
      });
  };
}

const styled = withStyles(styles);

interface DispatchProps {
  actions: {
    updateProfile: (p: Linode.Profile) => void;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => ({
  actions: {
    updateProfile: (p: Linode.Profile) => dispatch(handleUpdate(p))
  }
});

interface StateProps {
  status?: boolean;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  status: path(['data', 'email_notifications'], state.__resources.profile)
});

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

const enhanced = compose<CombinedProps, {}>(
  styled,
  connected
);

export default enhanced(ProfileSettings);
