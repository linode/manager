import { Profile } from '@linode/api-v4/lib/profile';
import { path } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Toggle from 'src/components/Toggle';
import withPreferences, {
  Props as PreferencesProps
} from 'src/containers/preferences.container';
import withFeatureFlags, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container.ts';
import { updateProfile as handleUpdateProfile } from 'src/store/profile/profile.requests';
import { MapState } from 'src/store/types';
import { getQueryParam } from 'src/utilities/queryParams';
import PreferenceEditor from './PreferenceEditor';
import ThemeToggle_CMR from './ThemeToggle_CMR';

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
  preferenceEditorOpen: boolean;
}

interface Props {
  toggleTheme: () => void;
}

type CombinedProps = Props &
  StateProps &
  DispatchProps &
  FeatureFlagConsumerProps &
  PreferencesProps &
  WithStyles<ClassNames>;

class ProfileSettings extends React.Component<CombinedProps, State> {
  state: State = {
    submitting: false,
    preferenceEditorOpen: false
  };

  componentDidMount() {
    if (getQueryParam(window.location.search, 'preferenceEditor') === 'true') {
      this.setState({ preferenceEditorOpen: true });
    }
  }

  render() {
    const { classes, status, flags, toggleTheme, preferences } = this.props;

    const preferenceEditorMode =
      getQueryParam(window.location.search, 'preferenceEditor') === 'true';

    return (
      <>
        <DocumentTitleSegment segment="Settings" />
        <Paper className={classes.root}>
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
          {preferenceEditorMode && (
            <PreferenceEditor
              open={this.state.preferenceEditorOpen}
              onClose={() => this.setState({ preferenceEditorOpen: false })}
            />
          )}
        </Paper>
        {flags.cmr ? (
          <Paper className={classes.root}>
            <Typography variant="h2" className={classes.title}>
              Dark Mode
            </Typography>
            <Grid container alignItems="center">
              <Grid item xs={12}>
                <FormControlLabel
                  className="toggleLassie"
                  control={<ThemeToggle_CMR toggleTheme={toggleTheme} />}
                  label={`
                Dark mode is ${
                  preferences.theme === 'dark' ? 'enabled' : 'disabled'
                }
              `}
                  disabled={this.state.submitting}
                />
              </Grid>
            </Grid>
          </Paper>
        ) : null}
      </>
    );
  }

  toggle = () => {
    this.setState({ submitting: true });

    this.props
      .updateProfile({ email_notifications: !this.props.status })
      .then(() => {
        this.setState({ submitting: false });
      })
      .catch(() => {
        /* Couldnt really imagine this being an issue... 1*/
        this.setState({ submitting: false });
      });
  };
}

const styled = withStyles(styles);

interface DispatchProps {
  updateProfile: (p: Partial<Profile>) => Promise<Profile>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => ({
  updateProfile: (p: Profile) => dispatch(handleUpdateProfile(p) as any)
});

interface StateProps {
  status?: boolean;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  status: path(['data', 'email_notifications'], state.__resources.profile)
});

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, Props>(
  styled,
  withFeatureFlags,
  withPreferences(),
  connected
);

export default enhanced(ProfileSettings);
