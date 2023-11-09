import React from 'react';

import { Box } from 'src/components/Box';
import { Stack } from 'src/components/Stack';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Typography } from 'src/components/Typography';
import { pluralize } from 'src/utilities/pluralize';

import type { Configuration } from '@linode/api-v4';

interface Props {
  configuration: Configuration;
}

export const ConfigurationAccordionHeader = ({ configuration }: Props) => {
  return (
    <Stack
      alignItems="center"
      direction="row"
      flexWrap="wrap"
      gap={1}
      justifyContent="space-between"
      pr={2}
    >
      <Stack alignItems="center" direction="row" spacing={1}>
        <Typography variant="h3">{configuration.label}</Typography>
        <Typography>&mdash;</Typography>
        <Typography fontSize="1rem">
          Port {configuration.port} -{' '}
          {pluralize('Route', 'Routes', configuration.routes.length)}
        </Typography>
      </Stack>
      {/* TODO: AGLB - Hook up endpoint status */}
      <Stack direction="row" spacing={2}>
        <Stack alignItems="center" direction="row" spacing={1}>
          <Typography>Endpoints:</Typography>
          <StatusIcon status="active" />
          <Typography>4 up</Typography>
          <Typography>&mdash;</Typography>
          <StatusIcon status="error" />
          <Typography>6 down</Typography>
        </Stack>
        <Box>
          <Typography>ID: {configuration.id}</Typography>
        </Box>
      </Stack>
    </Stack>
  );
};
