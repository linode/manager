import Stack from '@mui/material/Stack';
import React from 'react';
import { useParams } from 'react-router-dom';

import { Delete } from './Settings/Delete';
import { Label } from './Settings/Label';
import { Region } from './Settings/Region';

export const LoadBalancerSettings = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();

  const id = Number(loadbalancerId);

  return (
    <Stack spacing={2}>
      <Label loadbalancerId={id} />
      <Region loadbalancerId={id} />
      <Delete loadbalancerId={id} />
    </Stack>
  );
};
