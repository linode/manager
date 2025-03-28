import {
  FormControlLabel,
  FormHelperText,
  Toggle,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import type { NodeBalancerConfigPanelProps } from './types';

export const PassiveCheck = (props: NodeBalancerConfigPanelProps) => {
  const { checkPassive, disabled } = props;

  const onCheckPassiveChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: boolean
  ) => props.onCheckPassiveChange(value);

  return (
    <Grid
      sx={{ padding: 1 }}
      size={{
        md: 6,
        xs: 12,
      }}
    >
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography data-qa-passive-checks-header variant="h2">
            Passive Checks
          </Typography>
        </Grid>
        <Grid size={12}>
          <FormControlLabel
            control={
              <Toggle
                checked={checkPassive}
                data-qa-passive-checks-toggle={checkPassive}
                disabled={disabled}
                onChange={onCheckPassiveChange}
              />
            }
            label="Passive Checks"
          />
          <FormHelperText>
            When enabled, the NodeBalancer monitors requests to backends. If a
            request times out, returns a 5xx response (except 501/505), or fails
            to connect, the backend is marked 'down' and removed from rotation.
          </FormHelperText>
        </Grid>
      </Grid>
    </Grid>
  );
};
