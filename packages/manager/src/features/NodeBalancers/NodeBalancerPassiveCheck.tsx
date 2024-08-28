import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { FormControlLabel } from 'src/components/FormControlLabel';
import { FormHelperText } from 'src/components/FormHelperText';
import { Toggle } from 'src/components/Toggle/Toggle';
import { Typography } from 'src/components/Typography';

import type { NodeBalancerConfigPanelProps } from './types';

export const PassiveCheck = (props: NodeBalancerConfigPanelProps) => {
  const { checkPassive, disabled } = props;

  const onCheckPassiveChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: boolean
  ) => props.onCheckPassiveChange(value);

  return (
    (<Grid
      sx={{ padding: 1 }}
      size={{
        md: 6,
        xs: 12
      }}>
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
            Enable passive checks based on observing communication with back-end
            nodes.
          </FormHelperText>
        </Grid>
      </Grid>
    </Grid>)
  );
};
