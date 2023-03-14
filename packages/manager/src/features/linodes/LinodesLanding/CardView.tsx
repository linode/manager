import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { PaginationProps } from 'src/components/Paginate';
import TagDrawer, { TagDrawerProps } from 'src/components/TagCell/TagDrawer';
import LinodeEntityDetail from 'src/features/linodes/LinodeEntityDetail';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import { notificationContext as _notificationContext } from 'src/features/NotificationCenter/NotificationContext';
import useLinodeActions from 'src/hooks/useLinodeActions';
import { useProfile } from 'src/queries/profile';
import { getVolumesForLinode, useAllVolumesQuery } from 'src/queries/volumes';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';

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

interface Props {
  data: LinodeWithMaintenance[];
  showHead?: boolean;
  openDialog: (type: DialogType, linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  linodeConfigs: Config[];
  linodeLabel: string;
  linodeID: number;
}

type CombinedProps = Props & PaginationProps;

const CardView: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const notificationContext = React.useContext(_notificationContext);

  const { updateLinode } = useLinodeActions();
  const { data: profile } = useProfile();

  // When someone uses card view, sadly, this is the best way for us to populate volume counts.
  const { data: volumes, isLoading } = useAllVolumesQuery();

  const [tagDrawer, setTagDrawer] = React.useState<TagDrawerProps>({
    open: false,
    tags: [],
    label: '',
    entityID: 0,
  });

  const closeTagDrawer = () => {
    setTagDrawer({ ...tagDrawer, open: false });
  };

  const openTagDrawer = (tags: string[]) => {
    setTagDrawer({
      open: true,
      label: linodeLabel,
      tags,
      entityID: linodeID,
    });
  };

  const updateTags = (linodeId: number, tags: string[]) => {
    return updateLinode({ linodeId, tags }).then((_) => {
      setTagDrawer({ ...tagDrawer, tags });
    });
  };

  const {
    data,
    openDialog,
    openPowerActionDialog,
    linodeConfigs,
    linodeLabel,
    linodeID,
  } = props;

  if (!profile?.username) {
    return null;
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  if (data.length === 0) {
    return (
      <Typography style={{ textAlign: 'center' }}>
        No items to display.
      </Typography>
    );
  }

  const getVolumesByLinode = (linodeId: number) =>
    volumes ? getVolumesForLinode(volumes, linodeId).length : 0;

  return (
    <React.Fragment>
      <Grid container className="m0" style={{ width: '100%' }}>
        {data.map((linode, idx: number) => (
          <React.Fragment key={`linode-card-${idx}`}>
            <Grid item xs={12} className={`${classes.summaryOuter} py0`}>
              <LinodeEntityDetail
                variant="landing"
                id={linode.id}
                linode={linode}
                isDetailLanding
                numVolumes={getVolumesByLinode(linode.id)}
                username={profile?.username}
                linodeConfigs={linodeConfigs}
                backups={linode.backups}
                openTagDrawer={openTagDrawer}
                openDialog={openDialog}
                openPowerActionDialog={openPowerActionDialog}
                openNotificationMenu={notificationContext.openMenu}
              />
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
      <TagDrawer
        entityLabel={tagDrawer.label}
        open={tagDrawer.open}
        tags={tagDrawer.tags}
        updateTags={(tags) => updateTags(tagDrawer.entityID, tags)}
        onClose={closeTagDrawer}
      />
    </React.Fragment>
  );
};

export default CardView;
