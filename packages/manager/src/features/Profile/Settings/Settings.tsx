import { FormLabel } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { isOSMac } from 'src/App';
import { Code } from 'src/components/Code/Code';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Paper } from 'src/components/Paper';
import { Radio } from 'src/components/Radio/Radio';
import { Toggle } from 'src/components/Toggle';
import { Typography } from 'src/components/Typography';
import { FormControl } from 'src/components/FormControl';
import { RadioGroup } from 'src/components/RadioGroup';
import { useMutatePreferences, usePreferences } from 'src/queries/preferences';
import { useMutateProfile, useProfile } from 'src/queries/profile';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';
import { ThemeChoice } from 'src/utilities/theme';

import { PreferenceEditor } from './PreferenceEditor';

export const ProfileSettings = () => {
  const theme = useTheme();
  const [
    preferenceEditorOpen,
    setPreferenceEditorOpen,
  ] = React.useState<boolean>(
    Boolean(
      getQueryParamFromQueryString(window.location.search, 'preferenceEditor')
    )
  );

  const { data: profile } = useProfile();
  const { isLoading, mutateAsync: updateProfile } = useMutateProfile();

  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  return (
    <>
      <DocumentTitleSegment segment="My Settings" />
      <Paper sx={{ marginTop: theme.spacing(2) }}>
        <Typography sx={{ marginBottom: theme.spacing(2) }} variant="h2">
          Notifications
        </Typography>
        <Grid alignItems="center" container>
          <Grid xs={12}>
            <FormControlLabel
              control={
                <Toggle
                  onChange={(_, checked) =>
                    updateProfile({
                      email_notifications: checked,
                    })
                  }
                  checked={profile?.email_notifications ?? false}
                />
              }
              label={`
                Email alerts for account activity are ${
                  profile?.email_notifications === true ? 'enabled' : 'disabled'
                }
              `}
              disabled={isLoading}
            />
          </Grid>
        </Grid>
        {preferenceEditorOpen && (
          <PreferenceEditor
            onClose={() => setPreferenceEditorOpen(false)}
            open={preferenceEditorOpen}
          />
        )}
      </Paper>
      <Paper sx={{ marginTop: theme.spacing(2) }}>
        <Grid alignItems="center" container>
          <Grid xs={12}>
            <FormControl>
              <FormLabel>
                <Typography variant="h2">Theme</Typography>
              </FormLabel>
              <Typography variant="body1">
                You may toggle your theme with the keyboard shortcut{' '}
                {ThemeKeyboardShortcut}.
              </Typography>
              <RadioGroup
                onChange={(e) =>
                  updatePreferences({ theme: e.target.value as ThemeChoice })
                }
                row
                style={{ marginBottom: 0 }}
                value={preferences?.theme ?? 'system'}
              >
                <FormControlLabel
                  control={<Radio />}
                  label="Light"
                  value="light"
                />
                <FormControlLabel
                  control={<Radio />}
                  label="Dark"
                  value="dark"
                />
                <FormControlLabel
                  control={<Radio />}
                  label="System"
                  value="system"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ marginTop: theme.spacing(2) }}>
        <Typography sx={{ marginBottom: theme.spacing(2) }} variant="h2">
          Type-to-Confirm
        </Typography>
        <Typography variant="body1">
          For some products and services, the type-to-confirm setting requires
          entering the label before deletion.
        </Typography>
        <Grid alignItems="center" container>
          <Grid xs={12}>
            <FormControlLabel
              control={
                <Toggle
                  onChange={(_, checked) =>
                    updatePreferences({ type_to_confirm: checked })
                  }
                  checked={preferences?.type_to_confirm ?? false}
                />
              }
              label={`Type-to-confirm is ${
                preferences?.type_to_confirm ? 'enabled' : 'disabled'
              }`}
            />
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

const ThemeKeyboardShortcut = (
  <>
    <Code>{isOSMac ? 'Ctrl' : 'Alt'}</Code> + <Code>Shift</Code> +{' '}
    <Code>D</Code>
  </>
);
