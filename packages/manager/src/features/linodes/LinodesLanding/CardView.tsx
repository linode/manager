import { Image } from '@linode/api-v4/lib/images';
import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { PaginationProps } from 'src/components/Paginate';
import TagDrawer, { TagDrawerProps } from 'src/components/TagCell/TagDrawer';
import withImages from 'src/containers/withImages.container';
import LinodeEntityDetail from 'src/features/linodes/LinodeEntityDetail';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import { notificationContext as _notificationContext } from 'src/features/NotificationCenter/NotificationContext';
import useLinodeActions from 'src/hooks/useLinodeActions';
import useReduxLoad from 'src/hooks/useReduxLoad';
import useVolumes from 'src/hooks/useVolumes';
import { useProfile } from 'src/queries/profile';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';
import { getVolumesForLinode } from 'src/store/volume/volume.selector';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes pulse': {
    to: {
      backgroundColor: `hsla(40, 100%, 55%, 0)`,
    },
  },
  summaryOuter: {
    backgroundColor: theme.bg.bgPaper,
    margin: `${theme.spacing()}px 0`,
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

type CombinedProps = WithImagesProps & PaginationProps & Props;

const CardView: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const notificationContext = React.useContext(_notificationContext);

  const { updateLinode } = useLinodeActions();
  const { data: profile } = useProfile();
  const { _loading } = useReduxLoad(['volumes']);
  const { volumes } = useVolumes();
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

  const addTag = (linodeId: number, newTag: string) => {
    const _tags = [...tagDrawer.tags, newTag];
    return updateLinode({ linodeId, tags: _tags }).then((_) => {
      setTagDrawer({ ...tagDrawer, tags: _tags });
    });
  };

  const deleteTag = (linodeId: number, tagToDelete: string) => {
    const _tags = tagDrawer.tags.filter((thisTag) => thisTag !== tagToDelete);
    return updateLinode({ linodeId, tags: _tags }).then((_) => {
      setTagDrawer({ ...tagDrawer, tags: _tags });
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

  if (_loading) {
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
    getVolumesForLinode(volumes.itemsById, linodeId).length;

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
        addTag={(newTag: string) => addTag(tagDrawer.entityID, newTag)}
        deleteTag={(tag: string) => deleteTag(tagDrawer.entityID, tag)}
        onClose={closeTagDrawer}
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
    imagesData,
  }))
);

export default enhanced(CardView);
