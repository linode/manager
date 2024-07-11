import { styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { useLinodeQuery } from 'src/queries/linodes/linodes';

import { DNSResolvers } from './DNSResolvers';
import { NetworkTransfer } from './NetworkTransfer';
import { TransferHistory } from './TransferHistory';

interface Props {
  linodeId: number;
}

export const LinodeNetworkingSummaryPanel = React.memo((props: Props) => {
  // @todo maybe move this query closer to the consuming component
  const { data: linode } = useLinodeQuery(props.linodeId);
  const theme = useTheme();

  if (!linode) {
    return null;
  }

  return (
    <Paper>
      <Grid container spacing={4} sx={{ flexGrow: 1 }}>
        <Grid md={2.5} sm={6} xs={12}>
          <NetworkTransfer
            linodeId={linode.id}
            linodeLabel={linode.label}
            linodeRegionId={linode.region}
            linodeType={linode.type}
          />
        </Grid>
        <Grid
          sx={{
            [theme.breakpoints.down('md')]: {
              order: 3,
            },
          }}
          md
          sm
          xs={12}
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
          md={3.5}
          sm={6}
          xs={12}
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
