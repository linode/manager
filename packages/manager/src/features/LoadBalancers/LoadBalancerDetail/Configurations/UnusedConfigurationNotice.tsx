import { APIError } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import React from 'react';

import { Button } from 'src/components/Button/Button';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import {
  useLoadBalancerMutation,
  useLoadBalancerQuery,
} from 'src/queries/aglb/loadbalancers';

interface Props {
  configurationId: number;
  loadbalancerId: number;
}

export const UnusedConfigurationNotice = (props: Props) => {
  const { configurationId, loadbalancerId } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { data: loadbalancer } = useLoadBalancerQuery(loadbalancerId);
  const {
    isLoading,
    mutateAsync: updateLoadbalancer,
  } = useLoadBalancerMutation(loadbalancerId);

  const isConfigurationUsed = loadbalancer?.configurations.some(
    (config) => config.id === configurationId
  );

  const onAttach = async () => {
    if (!loadbalancer) {
      return;
    }

    const existingConfigs = loadbalancer?.configurations.map(
      (config) => config.id
    );

    try {
      await updateLoadbalancer({
        configuration_ids: [...existingConfigs, configurationId],
      });

      enqueueSnackbar(
        `Successfully enabled configuration ${configurationId}.`,
        {
          variant: 'success',
        }
      );
    } catch (error) {
      enqueueSnackbar((error as APIError[])[0].reason, {
        variant: 'error',
      });
    }
  };

  if (isConfigurationUsed) {
    return null;
  }

  return (
    <Notice variant="warning">
      <Stack alignItems="center" direction="row" display="flex" gap={2}>
        <Typography>
          This Configuration is not in use by your Load Balancer.
        </Typography>
        <Button buttonType="primary" loading={isLoading} onClick={onAttach}>
          Enable
        </Button>
      </Stack>
    </Notice>
  );
};
