import { Event } from '@linode/api-v4/lib/account';
import { Disk, LinodeStatus } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';
import { linodeInTransition } from 'src/features/linodes/transitions';
import LinodeBusyStatus from '../LinodeSummary/LinodeBusyStatus';
import HostMaintenance from './HostMaintenance';
import MutationNotification from './MutationNotification';
import Notifications from './Notifications';
import LinodeEntityDetail from 'src/features/linodes/LinodeEntityDetail';
import {
  LinodeDetailContext,
  withLinodeDetailContext
} from '../linodeDetailContext';
import { Config } from '@linode/api-v4/lib/linodes';
import { Action as BootAction } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import useProfile from 'src/hooks/useProfile';
import useReduxLoad from 'src/hooks/useReduxLoad';
import useVolumes from 'src/hooks/useVolumes';
import { getVolumesForLinode } from 'src/store/volume/volume.selector';
import CircleProgress from 'src/components/CircleProgress';
import useLinodes from 'src/hooks/useLinodes';
import TagDrawer from 'src/components/TagCell/TagDrawer';

interface Props {
  numVolumes: number;
  username: string;
  linodeConfigs: Config[];
  openDeleteDialog: (linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: BootAction,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  openLinodeResize: (linodeID: number) => void;
}

interface TagDrawerProps {
  tags: string[];
  open: boolean;
}

type CombinedProps = Props & LinodeDetailContext & LinodeContext;

const LinodeDetailHeader: React.FC<CombinedProps> = props => {
  const {
    linode,
    linodeEvents,
    linodeStatus,
    linodeDisks,
    linodeConfigs,
    openPowerActionDialog,
    openDeleteDialog,
    openLinodeResize
  } = props;
  const [tagDrawer, setTagDrawer] = React.useState<TagDrawerProps>({
    open: false,
    tags: []
  });

  const { updateLinode } = useLinodes();

  const closeTagDrawer = () => {
    setTagDrawer({ ...tagDrawer, open: false });
  };

  const openTagDrawer = (tags: string[]) => {
    setTagDrawer({
      open: true,
      tags
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
  const firstEventWithProgress = (linodeEvents || []).find(
    eachEvent => typeof eachEvent.percent_complete === 'number'
  );
  const { profile } = useProfile();
  const { _loading } = useReduxLoad(['volumes']);
  const { volumes } = useVolumes();

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
      <HostMaintenance linodeStatus={linodeStatus} />
      <MutationNotification disks={linodeDisks} />
      <Notifications />
      <LinodeEntityDetail
        variant="details"
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
      {linodeInTransition(linodeStatus, firstEventWithProgress) && (
        <LinodeBusyStatus />
      )}
      <TagDrawer
        entityLabel={linode.label}
        open={tagDrawer.open}
        tags={tagDrawer.tags}
        addTag={(newTag: string) => addTag(linode.id, newTag)}
        deleteTag={(tag: string) => deleteTag(linode.id, tag)}
        onClose={closeTagDrawer}
      />
    </React.Fragment>
  );
};

interface LinodeContext {
  linodeStatus: LinodeStatus;
  linodeEvents: Event[];
  linodeDisks: Disk[];
}

export default compose<CombinedProps, {}>(
  withLinodeDetailContext<LinodeContext>(({ linode }) => ({
    linode,
    linodeStatus: linode.status,
    linodeEvents: linode._events,
    linodeDisks: linode._disks,
    configs: linode._configs
  }))
)(LinodeDetailHeader);
