import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme, withTheme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Toggle from 'src/components/Toggle';
import { useMutateProfile, useProfile } from 'src/queries/profile';
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

interface Props {
  toggleTheme: () => void;
}

const ProfileSettings: React.FC<Props & { theme: Theme }> = (props) => {
  const classes = useStyles();
  const { toggleTheme, theme } = props;
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [
    preferenceEditorOpen,
    setPreferenceEditorOpen,
  ] = React.useState<boolean>(false);

  const { data: profile } = useProfile();
  const { mutateAsync: updateProfile } = useMutateProfile();

  React.useEffect(() => {
    if (getQueryParam(window.location.search, 'preferenceEditor') === 'true') {
      setPreferenceEditorOpen(true);
    }
  }, []);

  const preferenceEditorMode =
    getQueryParam(window.location.search, 'preferenceEditor') === 'true';

  const toggle = () => {
    setSubmitting(true);

    updateProfile({ email_notifications: !profile?.email_notifications })
      .then(() => {
        setSubmitting(false);
      })
      .catch(() => {
        setSubmitting(false);
      });
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
                theme.name === 'darkTheme' ? 'enabled' : 'disabled'
              }`}
              disabled={submitting}
            />
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default withTheme(ProfileSettings);
