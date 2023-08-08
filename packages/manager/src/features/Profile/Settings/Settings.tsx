import Stack from '@mui/material/Stack';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { isOSMac } from 'src/App';
import { Code } from 'src/components/Code/Code';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Paper } from 'src/components/Paper';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Toggle } from 'src/components/Toggle';
import { Typography } from 'src/components/Typography';
import { useMutatePreferences, usePreferences } from 'src/queries/preferences';
import { useMutateProfile, useProfile } from 'src/queries/profile';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';
import { ThemeChoice } from 'src/utilities/theme';

import { PreferenceEditor } from './PreferenceEditor';

export const ProfileSettings = () => {
  const location = useLocation();
  const history = useHistory();

  const preferenceEditorOpen = Boolean(
    getQueryParamFromQueryString(location.search, 'preferenceEditor')
  );

  const handleClosePreferenceEditor = () => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.delete('preferenceEditor');
    history.replace({ search: queryParams.toString() });
  };

  const { data: profile } = useProfile();
  const { isLoading, mutateAsync: updateProfile } = useMutateProfile();

  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  // Type-to-confirm is enabled by default (no preference is set)
  // or if the user explicitly enables it.
  const isTypeToConfirmEnabled =
    preferences?.type_to_confirm === undefined ||
    preferences?.type_to_confirm === true;

  const areEmailNotificationsEnabled = profile?.email_notifications === true;

  return (
    <Stack spacing={2}>
      <DocumentTitleSegment segment="My Settings" />
      <Paper>
        <Typography marginBottom={1} variant="h2">
          Notifications
        </Typography>
        <FormControlLabel
          control={
            <Toggle
              onChange={(_, checked) =>
                updateProfile({
                  email_notifications: checked,
                })
              }
              checked={areEmailNotificationsEnabled}
            />
          }
          label={`Email alerts for account activity are ${
            areEmailNotificationsEnabled ? 'enabled' : 'disabled'
          }`}
          disabled={isLoading}
        />
      </Paper>
      <Paper>
        <Typography marginBottom={1} variant="h2">
          Theme
        </Typography>
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
          <FormControlLabel control={<Radio />} label="Light" value="light" />
          <FormControlLabel control={<Radio />} label="Dark" value="dark" />
          <FormControlLabel control={<Radio />} label="System" value="system" />
        </RadioGroup>
      </Paper>
      <Paper>
        <Typography marginBottom={1} variant="h2">
          Type-to-Confirm
        </Typography>
        <Typography marginBottom={1} variant="body1">
          For some products and services, the type-to-confirm setting requires
          entering the label before deletion.
        </Typography>
        <FormControlLabel
          control={
            <Toggle
              onChange={(_, checked) =>
                updatePreferences({ type_to_confirm: checked })
              }
              checked={isTypeToConfirmEnabled}
            />
          }
          label={`Type-to-confirm is ${
            isTypeToConfirmEnabled ? 'enabled' : 'disabled'
          }`}
        />
      </Paper>
      <PreferenceEditor
        onClose={handleClosePreferenceEditor}
        open={preferenceEditorOpen}
      />
    </Stack>
  );
};

const ThemeKeyboardShortcut = (
  <>
    <Code>{isOSMac ? 'Ctrl' : 'Alt'}</Code> + <Code>Shift</Code> +{' '}
    <Code>D</Code>
  </>
);
