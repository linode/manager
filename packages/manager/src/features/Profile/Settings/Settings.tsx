import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import Toggle from 'src/components/Toggle';
import { useMutatePreferences, usePreferences } from 'src/queries/preferences';
import { useMutateProfile, useProfile } from 'src/queries/profile';
import { indicatePromise } from 'src/utilities/indicatePromise';
import { getQueryParam } from 'src/utilities/queryParams';
import PreferenceEditor from './PreferenceEditor';
import ThemeToggle from './ThemeToggle';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
}));

const ProfileSettings = () => {
  const classes = useStyles();
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [
    preferenceEditorOpen,
    setPreferenceEditorOpen,
  ] = React.useState<boolean>(false);

  const { data: profile } = useProfile();
  const { mutateAsync: updateProfile } = useMutateProfile();

  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const toggleTheme = () => {
    const newTheme = preferences?.theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: newTheme });
  };

  React.useEffect(() => {
    if (getQueryParam(window.location.search, 'preferenceEditor') === 'true') {
      setPreferenceEditorOpen(true);
    }
  }, []);

  const preferenceEditorMode =
    getQueryParam(window.location.search, 'preferenceEditor') === 'true';

  const toggle = () => {
    indicatePromise(
      updateProfile({
        email_notifications: !profile?.email_notifications,
      }),
      setSubmitting
    );
  };

  return (
    <>
      <DocumentTitleSegment segment="My Settings" />
      <Paper className={classes.root}>
        <Typography variant="h2" className={classes.title}>
          Notifications
        </Typography>
        <Grid container alignItems="center">
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Toggle
                  onChange={toggle}
                  checked={profile?.email_notifications}
                />
              }
              label={`
                Email alerts for account activity are ${
                  profile?.email_notifications === true ? 'enabled' : 'disabled'
                }
              `}
              disabled={submitting}
            />
          </Grid>
        </Grid>
        {preferenceEditorMode && (
          <PreferenceEditor
            open={preferenceEditorOpen}
            onClose={() => setPreferenceEditorOpen(false)}
          />
        )}
      </Paper>
      <Paper className={classes.root}>
        <Typography variant="h2" className={classes.title}>
          Dark Mode
        </Typography>
        <Grid container alignItems="center">
          <Grid item xs={12}>
            <FormControlLabel
              control={<ThemeToggle toggleTheme={toggleTheme} />}
              label={` Dark mode is ${
                preferences?.theme === 'dark' ? 'enabled' : 'disabled'
              }`}
              disabled={submitting}
            />
          </Grid>
        </Grid>
      </Paper>
      <Paper className={classes.root}>
        <Typography variant="h2" className={classes.title}>
          Type-to-Confirm
        </Typography>
        <Typography variant="body1">
          For some products and services, the type-to-confirm setting requires
          entering the label before deletion.
        </Typography>
        <PreferenceToggle<boolean>
          preferenceKey="type_to_confirm"
          preferenceOptions={[true, false]}
          localStorageKey="typeToConfirm"
        >
          {({
            preference: istypeToConfirm,
            togglePreference: toggleTypeToConfirm,
          }: ToggleProps<boolean>) => {
            return (
              <Grid container alignItems="center">
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Toggle
                        onChange={toggleTypeToConfirm}
                        checked={istypeToConfirm}
                      />
                    }
                    label={`Type-to-confirm is${
                      istypeToConfirm ? ' enabled' : ' disabled'
                    }`}
                  />
                </Grid>
              </Grid>
            );
          }}
        </PreferenceToggle>
      </Paper>
    </>
  );
};

export default ProfileSettings;
