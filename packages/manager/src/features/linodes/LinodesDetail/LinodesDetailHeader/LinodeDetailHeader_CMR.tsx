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
import PowerDialogOrDrawer, {
  Action as BootAction
} from 'src/features/linodes/PowerActionsDialogOrDrawer';
import useProfile from 'src/hooks/useProfile';
import useReduxLoad from 'src/hooks/useReduxLoad';
import useVolumes from 'src/hooks/useVolumes';
import { getVolumesForLinode } from 'src/store/volume/volume.selector';
import CircleProgress from 'src/components/CircleProgress';
import useLinodes from 'src/hooks/useLinodes';
import TagDrawer from 'src/components/TagCell/TagDrawer';
import DeleteDialog from '../../LinodesLanding/DeleteDialog';
import LinodeResize_CMR from '../LinodeResize/LinodeResize_CMR';

interface Props {
  numVolumes: number;
  username: string;
  linodeConfigs: Config[];
}

interface TagDrawerProps {
  tags: string[];
  open: boolean;
}

interface PowerDialogProps {
  open: boolean;
  linodeLabel: string;
  linodeId: number;
  bootAction?: BootAction;
  linodeConfigs?: Config[];
}

interface DeleteDialogProps {
  open: boolean;
  linodeLabel: string;
  linodeId: number;
}

interface ResizeDialogProps {
  open: boolean;
  linodeId: number;
}

type CombinedProps = Props & LinodeDetailContext & LinodeContext;

const LinodeDetailHeader: React.FC<CombinedProps> = props => {
  const {
    linode,
    linodeEvents,
    linodeStatus,
    linodeDisks,
    linodeConfigs
  } = props;

  const [powerDialog, setPowerDialog] = React.useState<PowerDialogProps>({
    open: false,
    linodeId: 0,
    linodeLabel: ''
  });

  const [deleteDialog, setDeleteDialog] = React.useState<DeleteDialogProps>({
    open: false,
    linodeId: 0,
    linodeLabel: ''
  });

  const [resizeDialog, setResizeDialog] = React.useState<ResizeDialogProps>({
    open: false,
    linodeId: 0
  });

  const [tagDrawer, setTagDrawer] = React.useState<TagDrawerProps>({
    open: false,
    tags: []
  });

  const { updateLinode } = useLinodes();

  const openPowerActionDialog = (
    bootAction: BootAction,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => {
    setPowerDialog({
      ...powerDialog,
      open: true,
      bootAction: bootAction,
      linodeConfigs: linodeConfigs,
      linodeId: linodeID,
      linodeLabel: linodeLabel
    });
  };

  const openDeleteDialog = (linodeID: number, linodeLabel: string) => {
    setDeleteDialog({
      ...deleteDialog,
      open: true,
      linodeLabel: linodeLabel,
      linodeId: linodeID
    });
  };

  const openResizeDialog = (linodeID: number) => {
    setResizeDialog({
      ...resizeDialog,
      open: true,
      linodeId: linodeID
    });
  };

  const closeDialogs = () => {
    setPowerDialog({ ...powerDialog, open: false });
    setDeleteDialog({ ...deleteDialog, open: false });
    setResizeDialog({ ...resizeDialog, open: false });
  };

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

  const deleteLinode = () => {};

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
        openLinodeResize={openResizeDialog}
      />
      {linodeInTransition(linodeStatus, firstEventWithProgress) && (
        <LinodeBusyStatus />
      )}
      <PowerDialogOrDrawer
        isOpen={powerDialog.open}
        action={powerDialog.bootAction}
        linodeID={powerDialog.linodeId}
        linodeLabel={powerDialog.linodeLabel}
        close={closeDialogs}
        linodeConfigs={powerDialog.linodeConfigs}
      />
      <DeleteDialog
        open={deleteDialog.open}
        onClose={closeDialogs}
        linodeID={deleteDialog.linodeId}
        linodeLabel={deleteDialog.linodeLabel}
        handleDelete={deleteLinode}
      />
      <LinodeResize_CMR
        open={resizeDialog.open}
        onClose={closeDialogs}
        linodeId={resizeDialog.linodeId}
      />
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
