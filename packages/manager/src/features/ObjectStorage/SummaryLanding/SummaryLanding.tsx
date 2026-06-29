import { Box, Typography } from '@linode/ui';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { useObjectStorageSelection } from 'src/features/ObjectStorage/ObjectStorageContext';
import { useFlags } from 'src/hooks/useFlags';

import { EndpointMultiselect } from '../Partials/EndpointMultiselect';
import { EndpointSummaryTable } from './EndpointSummaryTable/EndpointSummaryTable';

export const SummaryLanding = () => {
  const { objectStorageSummaryPageLinks } = useFlags();

  const {
    selectedSummaryEndpoints: selectedEndpoints,
    setSelectedSummaryEndpoints: setSelectedEndpoints,
  } = useObjectStorageSelection();

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
              color:
                theme.palette.mode === 'light'
                  ? theme.tokens.color.Neutrals[70]
                  : theme.tokens.color.Neutrals[5],
            })}
          >
            Select one or more endpoints in the dropdown list to view usage
            summaries for those endpoints. You can view quotas and request
            increases on the {''}
            <Link to="/quotas?service=object-storage">Quotas</Link> page.
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
