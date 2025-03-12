import { useLinodeQuery, useRegionsQuery } from '@linode/queries';
import { Paper } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { useFlags } from 'src/hooks/useFlags';

import { DNSResolvers } from './DNSResolvers';
import { NetworkTransfer } from './NetworkTransfer';
import { TransferHistory } from './TransferHistory';

interface Props {
  linodeId: number;
}

export const LinodeNetworkingSummaryPanel = React.memo((props: Props) => {
  const flags = useFlags();
  const theme = useTheme();
  // @todo maybe move this query closer to the consuming component
  const { data: linode } = useLinodeQuery(props.linodeId);
  const { data: regions } = useRegionsQuery();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(flags, regions);

  if (!linode) {
    return null;
  }

  const hideNetworkTransfer =
    isGeckoLAEnabled && linode.site_type === 'distributed';

  return (
    <Paper>
      <Grid container spacing={4} sx={{ flexGrow: 1 }}>
        {hideNetworkTransfer ? null : ( // Distributed compute instances have no transfer pool
          <Grid
            size={{
              md: 2.5,
              sm: 6,
              xs: 12,
            }}
          >
            <NetworkTransfer
              linodeId={linode.id}
              linodeLabel={linode.label}
              linodeRegionId={linode.region}
              linodeType={linode.type}
            />
          </Grid>
        )}
        <Grid
          size={{
            md: 'grow',
            sm: 'grow',
            xs: 12,
          }}
          sx={{
            [theme.breakpoints.down('md')]: {
              order: 3,
            },
          }}
        >
          <TransferHistory
            linodeCreated={linode.created}
            linodeID={linode.id}
          />
        </Grid>
        <StyledDnsResolverGrid
          sx={{
            paddingBottom: 0,
          }}
          size={{ md: 3.5, sm: hideNetworkTransfer ? 12 : 6, xs: 12 }}
        >
          <DNSResolvers region={linode.region} />
        </StyledDnsResolverGrid>
      </Grid>
    </Paper>
  );
});

const StyledDnsResolverGrid = styled(Grid, { label: 'StyledDnsResolverGrid' })(
  ({ theme }) => ({
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      order: 2,
    },
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-start',
    },
  })
);
