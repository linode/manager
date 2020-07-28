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

const useStyles = makeStyles(() => ({
  summaryOuter: {
    marginBottom: 20
  }
}));

interface Props {
  data: LinodeWithMaintenance[];
  images: Image[];
  showHead?: boolean;
  openDeleteDialog: (linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  openLinodeResize: (linodeID: number) => void;
  linodeConfigs: Config[];
  linodeLabel: string;
  linodeID: number;
}

type CombinedProps = WithImagesProps & PaginationProps & Props;

const CardView: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const flags = useFlags();
  const { profile } = useProfile();
  const { _loading } = useReduxLoad(['volumes']);
  const { volumes } = useVolumes();
  const [tagDrawer, setTagDrawer] = React.useState<TagDrawerProps>({
    open: false,
    tags: [],
    label: '',
    linodeID: 0
  });

  const { updateLinode } = useLinodes();

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
    openDeleteDialog,
    openPowerActionDialog,
    openLinodeResize,
    linodeConfigs,
    linodeLabel,
    linodeID
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
                    numVolumes={getVolumesByLinode(linode.id)}
                    username={profile.data?.username}
                    linodeConfigs={linodeConfigs}
                    backups={linode.backups}
                    openTagDrawer={openTagDrawer}
                    openDeleteDialog={openDeleteDialog}
                    openPowerActionDialog={openPowerActionDialog}
                    openLinodeResize={openLinodeResize}
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
                openDeleteDialog={openDeleteDialog}
                openPowerActionDialog={openPowerActionDialog}
                openLinodeResize={openLinodeResize}
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
  }))
);

export default enhanced(CardView);
