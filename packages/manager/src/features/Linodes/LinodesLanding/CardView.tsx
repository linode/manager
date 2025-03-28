import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { keyframes, styled } from '@mui/material/styles';
import * as React from 'react';

import { LinodeEntityDetail } from 'src/features/Linodes/LinodeEntityDetail';
import { useProfile } from '@linode/queries';

import type { RenderLinodesProps } from './DisplayLinodes';

export const CardView = (props: RenderLinodesProps) => {
  const { data, openDialog, openPowerActionDialog } = props;

  const { data: profile } = useProfile();

  if (!profile?.username) {
    return null;
  }

  if (data.length === 0) {
    return (
      <Typography style={{ textAlign: 'center' }}>
        No items to display.
      </Typography>
    );
  }

  return (
    <Grid className="m0" container style={{ width: '100%' }}>
      {data.map((linode, idx: number) => (
        <React.Fragment key={`linode-card-${idx}`}>
          <StyledSummaryGrid data-qa-linode-card={linode.id} size={{ xs: 12 }}>
            <LinodeEntityDetail
              handlers={{
                onOpenDeleteDialog: () =>
                  openDialog('delete', linode.id, linode.label),
                onOpenMigrateDialog: () =>
                  openDialog('migrate', linode.id, linode.label),
                onOpenPowerDialog: (action) =>
                  openPowerActionDialog(action, linode.id, linode.label, []),
                onOpenRebuildDialog: () =>
                  openDialog('rebuild', linode.id, linode.label),
                onOpenRescueDialog: () =>
                  openDialog('rescue', linode.id, linode.label),
                onOpenResizeDialog: () =>
                  openDialog('resize', linode.id, linode.label),
              }}
              id={linode.id}
              isSummaryView
              linode={linode}
            />
          </StyledSummaryGrid>
        </React.Fragment>
      ))}
    </Grid>
  );
};

const pulseAnimation = keyframes({
  to: {
    backgroundColor: `hsla(40, 100%, 55%, 0)`,
  },
});

const StyledSummaryGrid = styled(Grid, { label: 'StyledSummaryGrid' })(
  ({ theme }) => ({
    [`& .statusOther:before`]: {
      animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
    },
    [`&.MuiGrid-item`]: {
      padding: 0,
    },
    backgroundColor: theme.palette.background.paper,
    marginBottom: 20,
    paddingBottom: 0,
    paddingTop: 0, // from .py0 css class
  })
);
