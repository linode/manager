import React from 'react';
import { useParams } from 'react-router-dom';

import { Accordion } from 'src/components/Accordion';
import { Button } from 'src/components/Button/Button';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import {
  useLoadBalancerMutation,
  useLoadBalancerQuery,
} from 'src/queries/aglb/loadbalancers';

import { ConfigurationAccordionHeader } from './ConfigurationAccordionHeader';
import { ConfigurationForm } from './ConfigurationForm';

import type { Configuration } from '@linode/api-v4';

interface Props {
  configuration: Configuration;
}

export const ConfigurationAccordion = (props: Props) => {
  const { configuration } = props;
  const { configurationId } = useParams<{ configurationId: string }>();
  const { loadbalancerId: _loadbalancerId } = useParams<{
    loadbalancerId: string;
  }>();

  const loadbalancerId = Number(_loadbalancerId);

  const { data: loadbalancer } = useLoadBalancerQuery(loadbalancerId);
  const {
    mutateAsync: updateLoadbalancer,
    isLoading,
  } = useLoadBalancerMutation(loadbalancerId);

  const showNotAttachedWarning = !loadbalancer?.configurations.some(
    (config) => config.id === configuration.id
  );

  const onAttach = () => {
    if (!loadbalancer) {
      return;
    }
    const existingConfigs = loadbalancer?.configurations.map(
      (config) => config.id
    );
    updateLoadbalancer({
      configuration_ids: [...existingConfigs, configuration.id],
    });
  };

  return (
    <Accordion
      defaultExpanded={configuration.id === Number(configurationId)}
      heading={<ConfigurationAccordionHeader configuration={configuration} />}
      headingProps={{ sx: { width: '100%' } }}
    >
      {showNotAttachedWarning && (
        <Notice variant="warning">
          <Stack alignItems="center" direction="row" display="flex" gap={2}>
            <Typography>
              This Configuration is not in use by your Load Balancer.
            </Typography>
            <Button buttonType="primary" loading={isLoading} onClick={onAttach}>
              Attach
            </Button>
          </Stack>
        </Notice>
      )}
      <ConfigurationForm configuration={configuration} mode="edit" />
    </Accordion>
  );
};
