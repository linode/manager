import React from 'react';
import { useParams } from 'react-router-dom';

import { Accordion } from 'src/components/Accordion';

import { ConfigurationAccordionHeader } from './ConfigurationAccordionHeader';
import { ConfigurationForm } from './ConfigurationForm';
import { UnusedConfigurationNotice } from './UnusedConfigurationNotice';

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

  return (
    <Accordion
      defaultExpanded={configuration.id === Number(configurationId)}
      heading={<ConfigurationAccordionHeader configuration={configuration} />}
      headingProps={{ sx: { width: '100%' } }}
    >
      <UnusedConfigurationNotice
        configurationId={configuration.id}
        loadbalancerId={loadbalancerId}
      />
      <ConfigurationForm configuration={configuration} mode="edit" />
    </Accordion>
  );
};
