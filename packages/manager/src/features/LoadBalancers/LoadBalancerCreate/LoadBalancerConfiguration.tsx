import Stack from '@mui/material/Stack';
import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { VerticalLinearStepper } from 'src/components/VerticalLinearStepper/VerticalLinearStepper';

export const configurationSteps = [
  {
    content: <div>TODO: AGLB - Implement Details step content.</div>,
    handler: () => null,
    label: 'Details',
  },
  {
    content: <div>TODO: AGLB - Implement Service Targets Configuration.</div>,
    handler: () => null,
    label: 'Service Targets',
  },
  {
    content: <div>TODO: AGLB - Implement Routes Confiugataion.</div>,
    handler: () => null,
    label: 'Routes',
  },
];

export const LoadBalancerConfiguration = () => {
  return (
    <Paper>
      <Typography
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
        variant="h2"
      >
        Configuration -{' '}
      </Typography>
      <Stack spacing={1}>
        <Typography>
          A Configuration listens on a port and uses Route Rules to forward
          request to Service Target Endpoints
        </Typography>
        <VerticalLinearStepper steps={configurationSteps} />
      </Stack>
    </Paper>
  );
};
