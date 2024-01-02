import React, { useState } from 'react';

import { Accordion } from 'src/components/Accordion';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';

import { EditRouteAccordion } from '../EditRouteAccordion';
import { ConfigurationAccordionHeader } from './ConfigurationAccordionHeader';
import { ConfigurationDrawer } from './ConfigurationDrawer';

import type { LoadBalancerCreateFormData } from '../../../LoadBalancerCreateFormWrapper';

interface Props {
  configuration: LoadBalancerCreateFormData['configurations'][number];
  index: number;
}

export const ConfigurationAccordion = ({ configuration, index }: Props) => {
  const [
    showEditConfigurationDrawer,
    setShowEditConfigurationDrawer,
  ] = useState(false);

  const handleEditClick = () => {
    debugger;
    setShowEditConfigurationDrawer(true);
  };

  return (
    <>
      <Accordion
        heading={
          <ConfigurationAccordionHeader
            configuration={configuration}
            editClickHandler={handleEditClick}
          />
        }
        defaultExpanded={false}
        headingProps={{ sx: { width: '100%' } }}
        sx={{ paddingLeft: 1, paddingRight: 1.4 }}
      >
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Protocol</Typography>
          <Typography>{configuration.protocol.toLocaleUpperCase()}</Typography>
        </Stack>
        <Stack marginTop={1.5} spacing={0.5}>
          <Typography variant="subtitle2">Port</Typography>
          <Typography fontSize="1rem">{configuration.port}</Typography>
        </Stack>
        <Stack marginTop={1.5} spacing={0.5}>
          <Typography variant="subtitle2">TLS Certificates</Typography>
          <Typography>N/A</Typography>
        </Stack>
        <Stack marginTop={1.5} spacing={1}>
          <Typography variant="h3">Routes</Typography>
          {configuration.routes?.map((route, index) => (
            <EditRouteAccordion key={index} route={route} />
          ))}
        </Stack>
      </Accordion>
      <ConfigurationDrawer
        index={index}
        onClose={() => setShowEditConfigurationDrawer(false)}
        open={showEditConfigurationDrawer}
      />
    </>
  );
};
