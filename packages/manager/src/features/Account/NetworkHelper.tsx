import { FormControlLabel, Paper, Stack, Toggle, Typography } from '@linode/ui';
import * as React from 'react';

interface Props {
  hasPermission?: boolean;
  networkHelperEnabled: boolean;
  onChange: () => void;
}

export const NetworkHelper = ({
  networkHelperEnabled,
  onChange,
  hasPermission,
}: Props) => {
  return (
    <Paper>
      <Typography variant="h2">Network Helper</Typography>
      <Stack mt={1} spacing={1}>
        <Typography variant="body1">
          Network Helper automatically deposits a static networking
          configuration into your Linode at boot.
        </Typography>
        <Stack>
          <FormControlLabel
            control={
              <Toggle
                checked={networkHelperEnabled}
                data-qa-toggle-network-helper
                disabled={!hasPermission}
                onChange={onChange}
              />
            }
            label={
              networkHelperEnabled ? 'Enabled (default behavior)' : 'Disabled'
            }
          />
        </Stack>
      </Stack>
    </Paper>
  );
};
