import { FormControlLabel, Paper, Stack, Toggle, Typography } from '@linode/ui';
import * as React from 'react';

import { usePermissions } from '../IAM/hooks/usePermissions';

interface Props {
  networkHelperEnabled: boolean;
  onChange: () => void;
}

export const NetworkHelper = ({ networkHelperEnabled, onChange }: Props) => {
  const { data: permissions } = usePermissions('account', [
    'update_account_settings',
  ]);

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
                disabled={!permissions.update_account_settings}
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
