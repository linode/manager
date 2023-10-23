import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { VerticalLinearStepper } from 'src/components/VerticalLinearStepper/VerticalLinearStepper';

export const LoadBalancerConfiguration = () => {
  const theme = useTheme();

  const steps = [
    {
      content: <>TODO: Implement Details step content.</>,
      label: 'Details',
    },
    {
      content: <>TODO: Implement Service Targets Configuration.</>,
      label: 'Service Targets',
    },
    {
      content: <>TODO: Implement Routes Confiugataion.</>,
      label: 'Routes',
    },
  ];

  return (
    <Paper
      sx={{
        flexGrow: 1,
        marginTop: theme.spacing(3),
        width: '100%',
      }}
      data-qa-label-header
    >
      <Typography
        data-qa-tp-title
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
        variant="h2"
      >
        Configuration -{' '}
      </Typography>
      <Stack>
        <Typography sx={(theme) => ({ marginBottom: theme.spacing(1) })}>
          A Configuration listens on a port and uses Route Rules to forward
          request to Service Target Endpoints
        </Typography>
        <VerticalLinearStepper steps={steps} />
      </Stack>
    </Paper>
  );
};
