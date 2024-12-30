import { Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';

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
   * The color of the status icon that needs to be displayed
   */
  statusColor?: string;
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
  const { label, labelWidth = 4, statusColor, value, valueWidth = 8 } = props;

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
          {statusColor && ( // if the status color is passed, we will display a status icon with color needed
            <StatusIcon
              sx={{
                backgroundColor: statusColor, // here the background color is controlled by alerting component since there can be more statuses than active, inactive and other
              }}
              marginTop={theme.spacing(0.7)}
              maxHeight={theme.spacing(1)}
              maxWidth={theme.spacing(1)}
              pulse={false}
              status="other"
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
