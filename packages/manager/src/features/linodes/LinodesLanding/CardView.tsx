import { Image } from '@linode/api-v4/lib/images';
import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { PaginationProps } from 'src/components/Paginate';
import withImages from 'src/containers/withImages.container';
import LinodeEntityDetail from 'src/features/linodes/LinodeEntityDetail';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import { NotificationDrawer } from 'src/features/NotificationCenter';
import useNotificationData from 'src/features/NotificationCenter/NotificationData/useNotificationData';
import useFlags from 'src/hooks/useFlags';
import useProfile from 'src/hooks/useProfile';
import useReduxLoad from 'src/hooks/useReduxLoad';
import useVolumes from 'src/hooks/useVolumes';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';
import { getVolumesForLinode } from 'src/store/volume/volume.selector';
import formatDate from 'src/utilities/formatDate';
import { safeGetImageLabel } from 'src/utilities/safeGetImageLabel';
import LinodeCard from './LinodeCard';
import useLinodes from 'src/hooks/useLinodes';
import TagDrawer, { TagDrawerProps } from 'src/components/TagCell/TagDrawer';
import withRecentEvent, {
  WithRecentEvent
} from 'src/features/linodes/LinodesLanding/withRecentEvent';

const useStyles = makeStyles(() => ({
  '@keyframes blink': {
    '0%': {
      opacity: 1
    },
    '50%': {
      opacity: 0.25
    },
    '100%': {
      opacity: 1
    }
  },
  summaryOuter: {
    marginBottom: 20,
    '& .statusOther:before': {
      animation: '$blink 2.5s linear infinite'
    }
  }
}));

interface Props {
  data: LinodeWithMaintenance[];
  images: Image[];
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

type CombinedProps = WithImagesProps &
  WithRecentEvent &
  PaginationProps &
  Props;

const CardView: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const flags = useFlags();
  const notificationData = useNotificationData();

  const { updateLinode } = useLinodes();
  const { profile } = useProfile();
  const { _loading } = useReduxLoad(['volumes']);
  const { volumes } = useVolumes();
  const [tagDrawer, setTagDrawer] = React.useState<TagDrawerProps>({
    open: false,
    tags: [],
    label: '',
    linodeID: 0
  });
  const [notificationDrawerOpen, setNotificationDrawerOpen] = React.useState(
    false
  );

  const openNotificationDrawer = () => setNotificationDrawerOpen(true);
  const closeNotificationDrawer = () => setNotificationDrawerOpen(false);

  const closeTagDrawer = () => {
    setTagDrawer({ ...tagDrawer, open: false });
  };

  const openTagDrawer = (tags: string[]) => {
    setTagDrawer({
      open: true,
      label: linodeLabel,
      tags,
      linodeID
    });
  };

  const addTag = (linodeID: number, newTag: string) => {
    const _tags = [...tagDrawer.tags, newTag];
    return updateLinode({ linodeId: linodeID, tags: _tags }).then(_ => {
      setTagDrawer({ ...tagDrawer, tags: _tags });
    });
  };

  const deleteTag = (linodeId: number, tagToDelete: string) => {
    const _tags = tagDrawer.tags.filter(thisTag => thisTag !== tagToDelete);
    return updateLinode({ linodeId, tags: _tags }).then(_ => {
      setTagDrawer({ ...tagDrawer, tags: _tags });
    });
  };

  const {
    data,
    imagesData,
    openDialog,
    openPowerActionDialog,
    linodeConfigs,
    linodeLabel,
    linodeID,
    recentEvent
  } = props;

  if (!profile.data?.username) {
    return null;
  }

  if (_loading) {
    return <CircleProgress />;
  }

  const getVolumesByLinode = (linodeId: number) =>
    getVolumesForLinode(volumes.itemsById, linodeId).length;

  return (
    <React.Fragment>
      <Grid container>
        {flags.cmr
          ? data.map((linode, idx: number) => (
              <React.Fragment key={`linode-card-${idx}`}>
                <Grid item xs={12} className={`${classes.summaryOuter} py0`}>
                  <LinodeEntityDetail
                    variant="landing"
                    linode={linode}
                    isDetailLanding
                    numVolumes={getVolumesByLinode(linode.id)}
                    username={profile.data?.username}
                    linodeConfigs={linodeConfigs}
                    backups={linode.backups}
                    openTagDrawer={openTagDrawer}
                    openDialog={openDialog}
                    openPowerActionDialog={openPowerActionDialog}
                    openNotificationDrawer={openNotificationDrawer}
                    recentEvent={recentEvent}
                  />
                </Grid>
              </React.Fragment>
            ))
          : data.map((linode, idx: number) => (
              <LinodeCard
                key={`linode-card-${idx}`}
                backups={linode.backups}
                id={linode.id}
                ipv4={linode.ipv4}
                ipv6={linode.ipv6}
                maintenanceStartTime={
                  linode.maintenance?.when
                    ? formatDate(linode.maintenance.when)
                    : ''
                }
                label={linode.label}
                region={linode.region}
                status={linode.status}
                tags={linode.tags}
                disk={linode.specs.disk}
                vcpus={linode.specs.vcpus}
                memory={linode.specs.memory}
                type={linode.type}
                image={linode.image}
                imageLabel={safeGetImageLabel(imagesData, linode.image)}
                openDialog={openDialog}
                openPowerActionDialog={openPowerActionDialog}
              />
            ))}
      </Grid>
      <TagDrawer
        entityLabel={tagDrawer.label}
        open={tagDrawer.open}
        tags={tagDrawer.tags}
        addTag={(newTag: string) => addTag(tagDrawer.linodeID, newTag)}
        deleteTag={(tag: string) => deleteTag(tagDrawer.linodeID, tag)}
        onClose={closeTagDrawer}
      />
      <NotificationDrawer
        open={notificationDrawerOpen}
        onClose={closeNotificationDrawer}
        data={notificationData}
      />
    </React.Fragment>
  );
};

interface WithImagesProps {
  imagesData: Record<string, Image>;
}

const enhanced = compose<CombinedProps, Props>(
  withImages((ownProps, imagesData) => ({
    ...ownProps,
    imagesData
  })),
  withRecentEvent
);

export default enhanced(CardView);
