import { Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';

import type { Status } from 'src/components/StatusIcon/StatusIcon';

interface AlertDetailRowProps {
  /**
   * The label or title of the row
   */
  label: string;
  /**
   * Number of grid columns for the label on small and larger screens.
   * Defaults to 4. This controls the width of the label in the grid layout.
   */
  labelColumns?: number;
  /**
   * The status icon to be displayed in the row. It can represent states like "active", "inactive", etc.
   * Pass a valid status (e.g., 'active', 'inactive') to display the appropriate status icon.
   */
  status?: Status;
  /**
   * The value of the row
   */
  value: null | string;
  /**
   * Number of grid columns for the value on medium and larger screens.
   * Defaults to 8. This controls the width of the value in the grid layout.
   */
  valueColumns?: number;
}

export const AlertDetailRow = React.memo((props: AlertDetailRowProps) => {
  const { label, labelColumns = 4, status, value, valueColumns = 8 } = props;

  const theme = useTheme();

  return (
    <Grid container item xs={12}>
      <Grid item sm={labelColumns} xs={12}>
        <Typography fontSize="14px" variant="h3">
          {label}:
        </Typography>
      </Grid>
      <Grid container item sm={valueColumns} xs={12}>
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
          fontSize="14px"
          variant="body2"
        >
          {value}
        </Typography>
      </Grid>
    </Grid>
  );
});
