import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import TagDrawer, { TagDrawerProps } from 'src/components/TagCell/TagDrawer';
import LinodeEntityDetail from 'src/features/linodes/LinodeEntityDetail';
import { useProfile } from 'src/queries/profile';
import { RenderLinodesProps } from './DisplayLinodes';
import { useLinodeUpdateMutation } from 'src/queries/linodes/linodes';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes pulse': {
    to: {
      backgroundColor: `hsla(40, 100%, 55%, 0)`,
    },
  },
  summaryOuter: {
    backgroundColor: theme.bg.bgPaper,
    margin: `${theme.spacing()} 0`,
    marginBottom: 20,
    '&.MuiGrid-item': {
      padding: 0,
    },
    '& .statusOther:before': {
      animation: '$pulse 1.5s ease-in-out infinite',
    },
  },
}));

const CardView = (props: RenderLinodesProps) => {
  const classes = useStyles();

  const { data: profile } = useProfile();

  const [tagDrawer, setTagDrawer] = React.useState<TagDrawerProps>({
    open: false,
    tags: [],
    label: '',
    entityID: 0,
  });

  const { mutateAsync: updateLinode } = useLinodeUpdateMutation(
    tagDrawer.entityID
  );

  const closeTagDrawer = () => {
    setTagDrawer({ ...tagDrawer, open: false });
  };

  const openTagDrawer = (label: string, entityID: number, tags: string[]) => {
    setTagDrawer({
      open: true,
      label,
      tags,
      entityID,
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
      <Grid container className="m0" style={{ width: '100%' }}>
        {data.map((linode, idx: number) => (
          <React.Fragment key={`linode-card-${idx}`}>
            <Grid xs={12} className={`${classes.summaryOuter} py0`}>
              <LinodeEntityDetail
                id={linode.id}
                handlers={{
                  onOpenDeleteDialog: () =>
                    openDialog('delete', linode.id, linode.label),
                  onOpenMigrateDialog: () =>
                    openDialog('migrate', linode.id, linode.label),
                  onOpenRebuildDialog: () =>
                    openDialog('rebuild', linode.id, linode.label),
                  onOpenRescueDialog: () =>
                    openDialog('rescue', linode.id, linode.label),
                  onOpenResizeDialog: () =>
                    openDialog('resize', linode.id, linode.label),
                  onOpenPowerDialog: (action) =>
                    openPowerActionDialog(action, linode.id, linode.label, []),
                }}
                isSummaryView
                openTagDrawer={(tags) =>
                  openTagDrawer(linode.label, linode.id, tags)
                }
                linode={linode}
              />
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
      <TagDrawer
        entityLabel={tagDrawer.label}
        open={tagDrawer.open}
        tags={tagDrawer.tags}
        updateTags={updateTags}
        onClose={closeTagDrawer}
      />
    </React.Fragment>
  );
};

export default CardView;
