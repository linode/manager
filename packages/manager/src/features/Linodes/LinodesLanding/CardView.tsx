import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { TagDrawer, TagDrawerProps } from 'src/components/TagCell/TagDrawer';
import { Typography } from 'src/components/Typography';
import LinodeEntityDetail from 'src/features/Linodes/LinodeEntityDetail';
import { useLinodeUpdateMutation } from 'src/queries/linodes/linodes';
import { useProfile } from 'src/queries/profile';

import { RenderLinodesProps } from './DisplayLinodes';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes pulse': {
    to: {
      backgroundColor: `hsla(40, 100%, 55%, 0)`,
    },
  },
  summaryOuter: {
    '& .statusOther:before': {
      animation: '$pulse 1.5s ease-in-out infinite',
    },
    '&.MuiGrid-item': {
      padding: 0,
    },
    backgroundColor: theme.bg.bgPaper,
    marginBottom: 20,
  },
}));

const CardView = (props: RenderLinodesProps) => {
  const classes = useStyles();

  const { data: profile } = useProfile();

  const [tagDrawer, setTagDrawer] = React.useState<
    Omit<TagDrawerProps, 'onClose' | 'updateTags'>
  >({
    entityID: 0,
    entityLabel: '',
    open: false,
    tags: [],
  });

  const { mutateAsync: updateLinode } = useLinodeUpdateMutation(
    tagDrawer.entityID
  );

  const closeTagDrawer = () => {
    setTagDrawer({ ...tagDrawer, open: false });
  };

  const openTagDrawer = (
    entityLabel: string,
    entityID: number,
    tags: string[]
  ) => {
    setTagDrawer({
      entityID,
      entityLabel,
      open: true,
      tags,
    });
  };

  const updateTags = (tags: string[]) => {
    return updateLinode({ tags }).then((_) => {
      setTagDrawer({ ...tagDrawer, tags });
    });
  };

  const { data, openDialog, openPowerActionDialog } = props;

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
            <Grid className={`${classes.summaryOuter} py0`} xs={12}>
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
                openTagDrawer={(tags) =>
                  openTagDrawer(linode.label, linode.id, tags)
                }
                id={linode.id}
                isSummaryView
                linode={linode}
              />
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
      <TagDrawer
        entityID={tagDrawer.entityID}
        entityLabel={tagDrawer.entityLabel}
        onClose={closeTagDrawer}
        open={tagDrawer.open}
        tags={tagDrawer.tags}
        updateTags={updateTags}
      />
    </React.Fragment>
  );
};

export default CardView;
