import React from 'react';
import { useParams } from 'react-router-dom';

import { Accordion } from 'src/components/Accordion';

import { ConfigurationAccordionHeader } from './ConfigurationAccordionHeader';
import { ConfigurationForm } from './ConfigurationForm';

import type { Configuration } from '@linode/api-v4';

interface Props {
  configuration: Configuration;
}

export const ConfigurationAccordion = (props: Props) => {
  const { configuration } = props;
  const { configurationId } = useParams<{ configurationId: string }>();

  return (
    <Accordion
      defaultExpanded={configuration.id === Number(configurationId)}
      heading={<ConfigurationAccordionHeader configuration={configuration} />}
      headingProps={{ sx: { width: '100%' } }}
    >
      <ConfigurationForm configuration={configuration} mode="edit" />
    </Accordion>
  );
};
