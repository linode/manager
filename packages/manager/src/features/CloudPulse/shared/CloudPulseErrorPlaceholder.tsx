import { Grid, Paper } from '@mui/material';
import React from 'react';

import CloudPulseIcon from 'src/assets/icons/entityIcons/monitor.svg';
import { Placeholder } from 'src/components/Placeholder/Placeholder';

export const CloudPulseErrorPlaceholder = React.memo(
  (props: { errorMessage: string }) => {
    const { errorMessage } = props;
    return (
      <Grid item xs={12}>
        <Paper>
          <Placeholder
            icon={CloudPulseIcon}
            isEntity
            subtitle={errorMessage}
            title=""
          />
        </Paper>
      </Grid>
    );
  }
);
