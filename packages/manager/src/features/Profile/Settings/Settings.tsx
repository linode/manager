import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from 'src/components/core/Paper';
import PreferenceEditor from './PreferenceEditor';
import RadioGroup from 'src/components/core/RadioGroup';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { FormLabel } from '@mui/material';
import { getQueryParam } from 'src/utilities/queryParams';
import { PreferenceToggle } from 'src/components/PreferenceToggle/PreferenceToggle';
import { Radio } from 'src/components/Radio/Radio';
import { ThemeChoice } from 'src/utilities/theme';
import { Toggle } from 'src/components/Toggle';
import { useMutatePreferences, usePreferences } from 'src/queries/preferences';
import { useMutateProfile, useProfile } from 'src/queries/profile';
import { useTheme } from '@mui/material/styles';
import type { PreferenceToggleProps } from 'src/components/PreferenceToggle/PreferenceToggle';

export const ProfileSettings = () => {
  const theme = useTheme();
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [
    preferenceEditorOpen,
    setPreferenceEditorOpen,
  ] = React.useState<boolean>(false);

  const { data: profile } = useProfile();
  const { mutateAsync: updateProfile } = useMutateProfile();

  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  React.useEffect(() => {
    if (getQueryParam(window.location.search, 'preferenceEditor') === 'true') {
      setPreferenceEditorOpen(true);
    }
  }, []);

  const preferenceEditorMode =
    getQueryParam(window.location.search, 'preferenceEditor') === 'true';

  const toggle = () => {
    setSubmitting(true);
    updateProfile({
      email_notifications: !profile?.email_notifications,
    }).finally(() => setSubmitting(false));
  };

  return (
    <>
      <DocumentTitleSegment segment="My Settings" />
      <Paper sx={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h2" sx={{ marginBottom: theme.spacing(2) }}>
          Notifications
        </Typography>
        <Grid container alignItems="center">
          <Grid xs={12}>
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
      <Paper sx={{ marginTop: theme.spacing(2) }}>
        <Grid container alignItems="center">
          <Grid xs={12}>
            <FormControl>
              <FormLabel>
                <Typography variant="h2">Theme</Typography>
              </FormLabel>
              <RadioGroup
                row
                style={{ marginBottom: 0 }}
                value={preferences?.theme ?? 'system'}
                onChange={(e) =>
                  updatePreferences({ theme: e.target.value as ThemeChoice })
                }
              >
                <FormControlLabel
                  value="light"
                  control={<Radio />}
                  label="Light"
                />
                <FormControlLabel
                  value="dark"
                  control={<Radio />}
                  label="Dark"
                />
                <FormControlLabel
                  value="system"
                  control={<Radio />}
                  label="System"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h2" sx={{ marginBottom: theme.spacing(2) }}>
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
          }: PreferenceToggleProps<boolean>) => {
            return (
              <Grid container alignItems="center">
                <Grid xs={12}>
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
