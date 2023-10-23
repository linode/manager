import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Paper } from 'src/components/Paper';
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
      <VerticalLinearStepper steps={steps} />
    </Paper>
  );
};
