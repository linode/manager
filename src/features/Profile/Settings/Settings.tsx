import { compose } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Paper } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Toggle from 'src/components/Toggle';
import { updateProfile } from 'src/services/profile';
import { response } from 'src/store/reducers/resources';

type ClassNames = 'root'
  | 'title'
  | 'label';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
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

interface Props { }

interface ConnectedProps {
  status: boolean;
  response: (p: Linode.Profile) => void;
}

interface State {
  submitting: boolean;
}

type CombinedProps = Props & ConnectedProps & WithStyles<ClassNames>;

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
                Email alerts if a Linode exceeds its configurated thresholds are ${status ? 'enabled' : 'disabled'}
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
        this.props.response(profile)
        this.setState({ submitting: false });
      })
      .catch(() => { /* Couldnt really imagine this being an issue... 1*/ });
  }
}

const styled = withStyles(styles, { withTheme: true });

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
  response: (p: Linode.Profile) => response(['profile'], p),
}, dispatch);

const mapStateToProps = (state: Linode.AppState) => {
  return ({
    status: state.resources.profile!.data.email_notifications,
  })
};

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose(styled, connected)

export default enhanced(ProfileSettings);

