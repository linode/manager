import { Box, Typography } from '@linode/ui';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { useFlags } from 'src/hooks/useFlags';

import { EndpointMultiselect } from '../Partials/EndpointMultiselect';
import { EndpointSummaryTable } from './EndpointSummaryTable/EndpointSummaryTable';

import type { EndpointMultiselectValue } from '../Partials/EndpointMultiselect';

export const SummaryLanding = () => {
  const { objectStorageSummaryPageLinks } = useFlags();

  const [selectedEndpoints, setSelectedEndpoints] = React.useState<
    EndpointMultiselectValue[]
  >([]);

  return (
    <>
      <DocumentTitleSegment segment="Summary" />

      <Box
        sx={(theme) => ({
          backgroundColor: theme.bg.bgPaper,
          padding: theme.spacingFunction(20),
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacingFunction(24),
        })}
      >
        <Box
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacingFunction(8),
          })}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h3">Endpoint Summary</Typography>
            {objectStorageSummaryPageLinks && (
              <Link to="/object-storage/access-keys">Manage access keys</Link>
            )}
          </Box>

          <Typography
            sx={(theme) => ({
              color: theme.tokens.color.Neutrals[70],
            })}
          >
            Select one or more endpoints using the dropdown menu to view your
            usage details for those endpoints.
          </Typography>
        </Box>

        <Box sx={{ maxWidth: '630px' }}>
          <EndpointMultiselect
            onChange={setSelectedEndpoints}
            values={selectedEndpoints}
          />
        </Box>

        {!!selectedEndpoints.length && (
          <EndpointSummaryTable
            endpoints={selectedEndpoints.map((selected) => selected.endpoint)}
          />
        )}
      </Box>
    </>
  );
};
