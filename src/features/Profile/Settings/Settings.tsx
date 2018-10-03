import { compose, path } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import { Paper } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Toggle from 'src/components/Toggle';
import { updateProfile } from 'src/services/profile';
import { handleUpdate } from 'src/store/reducers/resources/profile';

type ClassNames = 'root'
  | 'title'
  | 'label';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    marginTop: theme.spacing.unit * 2,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  label: {
    marginLeft: theme.spacing.unit,
  },
});

interface State {
  submitting: boolean;
}

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

class ProfileSettings extends React.Component<CombinedProps, State> {
  state: State = {
    submitting: false,
  };

  render() {
    const { classes, status } = this.props;

    return (
      <Paper className={classes.root}>
        <DocumentTitleSegment segment="Settings" />
        <Typography role="header" variant="title" className={classes.title}>
          Notifications
        </Typography>
        <Grid container alignItems="center">
          <Grid item xs={12}>
            <FormControlLabel
              className="toggleLassie"
              control={
                <Toggle onChange={this.toggle} checked={status} />
              }
              label={`
                Email alerts if a Linode exceeds its configurated thresholds are ${status === true ? 'enabled' : 'disabled'}
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
      .then((profile) => {
        this.props.actions.updateProfile(profile)
        this.setState({ submitting: false });
      })
      .catch(() => { /* Couldnt really imagine this being an issue... 1*/ });
  }
}

const styled = withStyles(styles, { withTheme: true });

interface DispatchProps {
  actions: {
    updateProfile: (p: Linode.Profile) => void;
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch) => ({
  actions: {
    updateProfile: (p: Linode.Profile) => dispatch(handleUpdate(p)),
  }
});

interface StateProps {
  status?: boolean;
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state) => ({
  status: path(['data', 'email_notifications'], state.__resources.profile),
});


const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose(styled, connected)

export default enhanced(ProfileSettings);

