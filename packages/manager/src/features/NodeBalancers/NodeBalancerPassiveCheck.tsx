import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import Grid from '@mui/material/Unstable_Grid2';
import { Typography } from 'src/components/Typography';
import { Toggle } from 'src/components/Toggle';
import type { NodeBalancerConfigPanelProps } from './types';

export const PassiveCheck = (props: NodeBalancerConfigPanelProps) => {
  const { checkPassive, disabled } = props;

  const onCheckPassiveChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: boolean
  ) => props.onCheckPassiveChange(value);

  return (
    <Grid xs={12} md={6} sx={{ padding: 0 }}>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <Typography variant="h2" data-qa-passive-checks-header>
            Passive Checks
          </Typography>
        </Grid>
        <Grid xs={12}>
          <FormControlLabel
            control={
              <Toggle
                checked={checkPassive}
                onChange={onCheckPassiveChange}
                data-qa-passive-checks-toggle={checkPassive}
                disabled={disabled}
              />
            }
            label="Passive Checks"
          />
          <FormHelperText>
            Enable passive checks based on observing communication with back-end
            nodes.
          </FormHelperText>
        </Grid>
      </Grid>
    </Grid>
  );
};
