import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useGrants } from 'src/queries/profile';
import { getPermissionsForLinode } from 'src/utilities/linodes';

import { LinodePermissionsError } from '../../LinodePermissionsError';
import { DNSResolvers } from './DNSResolvers';
import { NetworkTransfer } from './NetworkTransfer';
import { TransferHistory } from './TransferHistory';

interface Props {
  linodeID: number;
}

export const LinodeNetworkingSummaryPanel = React.memo((props: Props) => {
  // @todo maybe move this query closer to the consuming component
  const { data: linode } = useLinodeQuery(props.linodeID);
  const theme = useTheme();

  const { data: grants } = useGrants();

  const readOnly =
    getPermissionsForLinode(grants, props.linodeID) === 'read_only';

  if (!linode) {
    return null;
  }

  return (
    <>
      {readOnly && <LinodePermissionsError />}
      <StyledPaper>
        <Grid container spacing={4} sx={{ flexGrow: 1 }}>
          <Grid md={2.5} sm={6} xs={12}>
            <NetworkTransfer linodeID={linode.id} linodeLabel={linode.label} />
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
      </StyledPaper>
    </>
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

const StyledPaper = styled(Paper, { label: 'StyledPaper' })(({ theme }) => ({
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(2.5),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));
