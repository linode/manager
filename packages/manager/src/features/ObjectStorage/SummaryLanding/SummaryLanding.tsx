import { Box, Typography } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';

import { EndpointMultiselect } from './Partials/EndpointMultiselect';
import { EndpointSummaryTable } from './Partials/EndpointSummaryTable';

import type { EndpointMultiselectValue } from './Partials/EndpointMultiselect';

export const SummaryLanding = () => {
  const [selectedEndpoints, setSelectedEndpoints] = React.useState<
    EndpointMultiselectValue[]
  >([]);

  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.bg.bgPaper,
        padding: theme.spacingFunction(24),
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacingFunction(16),
      })}
    >
      <Typography variant="h3">Endpoint View</Typography>
      <Typography>
        Select endpoint(s) in the dropdown to see a summary of your Global
        account. Check your usage and{' '}
        <Link to="/account/quotas">View Quotas</Link>.
      </Typography>

      <EndpointMultiselect
        onChange={setSelectedEndpoints}
        values={selectedEndpoints}
      />

      {!!selectedEndpoints.length && (
        <EndpointSummaryTable
          endpoints={selectedEndpoints.map((endpoint) => endpoint.label)}
        />
      )}
    </Box>
  );
};
