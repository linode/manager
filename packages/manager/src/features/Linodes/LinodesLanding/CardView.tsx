import { keyframes, styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { TagDrawer } from 'src/components/TagCell/TagDrawer';
import { Typography } from 'src/components/Typography';
import { LinodeEntityDetail } from 'src/features/Linodes/LinodeEntityDetail';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useLinodeUpdateMutation } from 'src/queries/linodes/linodes';
import { useProfile } from 'src/queries/profile/profile';

import { RenderLinodesProps } from './DisplayLinodes';

export const CardView = (props: RenderLinodesProps) => {
  const { data, openDialog, openPowerActionDialog } = props;

  const { data: profile } = useProfile();

  const [tagDrawerLinodeId, setTagDrawerLinodeId] = React.useState<number>();

  const tagDrawerLinode = React.useMemo(
    () => data.find((linode) => linode.id == tagDrawerLinodeId),
    [data, tagDrawerLinodeId]
  );

  const { mutateAsync: updateLinode } = useLinodeUpdateMutation(
    tagDrawerLinodeId ?? -1
  );

  const isLinodesGrantReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'linode',
    id: tagDrawerLinodeId,
  });

  const closeTagDrawer = () => {
    setTagDrawerLinodeId(undefined);
  };

  const updateTags = (tags: string[]) => {
    return updateLinode({ tags });
  };

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
    <React.Fragment>
      <Grid className="m0" container style={{ width: '100%' }}>
        {data.map((linode, idx: number) => (
          <React.Fragment key={`linode-card-${idx}`}>
            <StyledSummaryGrid data-qa-linode-card={linode.id} xs={12}>
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
                openTagDrawer={() => setTagDrawerLinodeId(linode.id)}
              />
            </StyledSummaryGrid>
          </React.Fragment>
        ))}
      </Grid>
      {tagDrawerLinode && (
        <TagDrawer
          disabled={isLinodesGrantReadOnly}
          entityLabel={tagDrawerLinode.label}
          onClose={closeTagDrawer}
          open
          tags={tagDrawerLinode.tags}
          updateTags={updateTags}
        />
      )}
    </React.Fragment>
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
