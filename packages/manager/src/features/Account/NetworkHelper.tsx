import { FormControlLabel, Paper, Toggle, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

interface Props {
  networkHelperEnabled: boolean;
  onChange: () => void;
}

export const NetworkHelper = ({ networkHelperEnabled, onChange }: Props) => {
  return (
    <Paper>
      <Typography variant="h2">Network Helper</Typography>
      <Grid container direction="column" mt={1} spacing={1}>
        <Grid>
          <Typography variant="body1">
            Network Helper automatically deposits a static networking
            configuration into your Linode at boot.
          </Typography>
        </Grid>
        <Grid>
          <FormControlLabel
            control={
              <Toggle
                checked={networkHelperEnabled}
                data-qa-toggle-network-helper
                onChange={onChange}
              />
            }
            label={
              networkHelperEnabled ? 'Enabled (default behavior)' : 'Disabled'
            }
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
