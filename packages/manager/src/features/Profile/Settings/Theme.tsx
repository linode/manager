import { useMutatePreferences, usePreferences } from '@linode/queries';
import {
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from '@linode/ui';
import { isOSMac } from '@linode/utilities';
import React, { ChangeEvent } from 'react';

import { Code } from 'src/components/Code/Code';
import { setStoredThemePreference } from 'src/utilities/theme';

import type { ThemeChoice } from '@linode/utilities';

export const Theme = () => {
  const { data: theme } = usePreferences((preferences) => preferences?.theme);
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const handleUpdatePreferences = (e: ChangeEvent<HTMLInputElement>) => {
    const theme = e.target.value as ThemeChoice;
    setStoredThemePreference(theme);
    e.currentTarget.dispatchEvent(
      new CustomEvent('theme-preference-changed', {
        detail: { theme },
        bubbles: true,
        composed: true,
      })
    );
    updatePreferences({ theme });
  };

  return (
    <Paper>
      <Typography marginBottom={1} variant="h2">
        Theme
      </Typography>
      <Typography variant="body1">
        You may toggle your theme with the keyboard shortcut{' '}
        <Code>{isOSMac ? 'Ctrl' : 'Alt'}</Code> + <Code>Shift</Code> +{' '}
        <Code>D</Code>.
      </Typography>
      <RadioGroup
        onChange={handleUpdatePreferences}
        row
        style={{ marginBottom: 0 }}
        value={theme ?? 'system'}
      >
        <FormControlLabel control={<Radio />} label="Light" value="light" />
        <FormControlLabel control={<Radio />} label="Dark" value="dark" />
        <FormControlLabel control={<Radio />} label="System" value="system" />
      </RadioGroup>
    </Paper>
  );
};
