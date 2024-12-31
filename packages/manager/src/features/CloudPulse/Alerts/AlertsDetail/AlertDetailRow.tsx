import { Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';

import type { Status } from 'src/components/StatusIcon/StatusIcon';

interface AlertDetailRowProps {
  /*
   * The typography label under which the value will be displayed
   */
  label: string;
  /*
   * Controls the size of the typography label from medium to larger screens
   */
  labelWidth?: number;
  /*
   * If the row is a status, this property can be passed to indicate a valid status like active, inactive
   */
  status?: Status;
  /*
   * The typography value to be displayed
   */
  value: null | string;
  /*
   * Controls the size of the typography value from medium to larger screens
   */
  valueWidth?: number;
}

export const AlertDetailRow = React.memo((props: AlertDetailRowProps) => {
  const { label, labelWidth = 4, status, value, valueWidth = 8 } = props;

  const theme = useTheme();

  return (
    <Grid item xs={12}>
      <Grid container>
        <Grid item sm={labelWidth} xs={12}>
          <Typography fontSize={theme.spacing(1.75)} variant="h2">
            {label}:
          </Typography>
        </Grid>
        <Grid display="flex" item sm={valueWidth} xs={12}>
          {status && (
            <StatusIcon
              marginTop={theme.spacing(0.7)}
              maxHeight={theme.spacing(1)}
              maxWidth={theme.spacing(1)}
              pulse={false}
              status={status}
            />
          )}
          <Typography
            sx={{
              color: theme.color.offBlack,
            }}
            fontSize={theme.spacing(1.75)}
            variant="body2"
          >
            {value}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
});
