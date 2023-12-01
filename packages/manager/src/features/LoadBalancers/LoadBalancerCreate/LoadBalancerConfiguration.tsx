import Stack from '@mui/material/Stack';
import { useFormikContext } from 'formik';
import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { VerticalLinearStepper } from 'src/components/VerticalLinearStepper/VerticalLinearStepper';

import { ConfigurationDetails } from './ConfigurationDetails';

import type { CreateLoadbalancerPayload } from '@linode/api-v4';

interface Props {
  index: number;
  name: string;
}

export const LoadBalancerConfiguration = ({ index, name }: Props) => {
  const configurationSteps = [
    {
      content: <ConfigurationDetails index={index} name={name} />,
      handler: () => null,
      label: 'Details',
    },
    {
      content: <div>TODO: AGLB - Implement Service Targets Configuration.</div>,
      handler: () => null,
      label: 'Service Targets',
    },
    {
      content: <div>TODO: AGLB - Implement Routes Configuration.</div>,
      handler: () => null,
      label: 'Routes',
    },
  ];

  const { values } = useFormikContext<CreateLoadbalancerPayload>();

  return (
    <Paper>
      <Typography
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
        variant="h2"
      >
        Configuration -{values[name]?.[index]?.label}
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
