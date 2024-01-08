import Stack from '@mui/material/Stack';
import { useFormikContext } from 'formik';
import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { VerticalLinearStepper } from 'src/components/VerticalLinearStepper/VerticalLinearStepper';

import { ConfigurationDetails } from './ConfigurationDetails';
import { Handlers } from './LoadBalancerConfigurations';
import { Routes } from './Routes';
import { ServiceTargets } from './ServiceTargets';

import type { LoadBalancerCreateFormData } from './LoadBalancerCreate';

interface Props {
  handlers: Handlers;
  index: number;
}

export const LoadBalancerConfiguration = ({ handlers, index }: Props) => {
  const configurationSteps = [
    {
      content: <ConfigurationDetails handlers={handlers} index={index} />,
      label: 'Details',
    },
    {
      content: (
        <ServiceTargets configurationIndex={index} handlers={handlers} />
      ),
      label: 'Service Targets',
    },
    {
      content: <Routes configurationIndex={index} handlers={handlers} />,
      label: 'Routes',
    },
  ];

  const { values } = useFormikContext<LoadBalancerCreateFormData>();

  return (
    <Paper>
      <Typography
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
        variant="h2"
      >
        Configuration - {values.configurations?.[index]?.label}
      </Typography>
      <Stack spacing={1}>
        <Typography>
          The load balancer configuration for processing incoming requests, the
          service targets it directs requests to and routing rules.
        </Typography>
        <VerticalLinearStepper steps={configurationSteps} />
      </Stack>
    </Paper>
  );
};
