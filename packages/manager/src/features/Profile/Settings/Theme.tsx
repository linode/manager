import { useMutatePreferences, usePreferences } from '@linode/queries';
import {
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from '@linode/ui';
import { isOSMac } from '@linode/utilities';
import React from 'react';

import { Code } from 'src/components/Code/Code';

import type { ThemeChoice } from '@linode/utilities';

export const Theme = () => {
  const { data: theme } = usePreferences((preferences) => preferences?.theme);
  const { mutateAsync: updatePreferences } = useMutatePreferences();

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
        onChange={(e) =>
          updatePreferences({ theme: e.target.value as ThemeChoice })
        }
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
