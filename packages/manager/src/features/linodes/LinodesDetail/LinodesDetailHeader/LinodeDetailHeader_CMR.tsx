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
import { DialogType } from 'src/features/linodes/types';
import useProfile from 'src/hooks/useProfile';
import useReduxLoad from 'src/hooks/useReduxLoad';
import useVolumes from 'src/hooks/useVolumes';
import { getVolumesForLinode } from 'src/store/volume/volume.selector';
import CircleProgress from 'src/components/CircleProgress';
import useLinodes from 'src/hooks/useLinodes';
import TagDrawer from 'src/components/TagCell/TagDrawer';
import DeleteDialog from '../../LinodesLanding/DeleteDialog';
import LinodeRebuildDialog from '../LinodeRebuild/LinodeRebuildDialog';
import RescueDialog from '../LinodeRescue/RescueDialog';
import LinodeResize_CMR from '../LinodeResize/LinodeResize_CMR';
import MigrateLinode from '../../MigrateLanding/MigrateLinode';
import EnableBackupDialog from '../LinodeBackup/EnableBackupsDialog';
import { useHistory, useRouteMatch } from 'react-router-dom';

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
  linodeID: number;
  bootAction?: BootAction;
  linodeConfigs?: Config[];
}

interface DialogProps {
  open: boolean;
  linodeLabel?: string;
  linodeID: number;
}

type CombinedProps = Props & LinodeDetailContext & LinodeContext;

const LinodeDetailHeader: React.FC<CombinedProps> = props => {
  // Several routes that used to have dedicated pages (e.g. /resize, /rescue)
  // now show their content in modals instead. Use this matching to determine
  // if a modal should be open when this component is first rendered.
  const match = useRouteMatch<{ linodeId: string; action: string }>({
    path: '/linodes/:linodeId/:action'
  });
  const isAction = (action: string) => match?.params?.action === action;
  const matchedLinodeId = Number(match?.params?.linodeId ?? 0);

  const {
    linode,
    linodeEvents,
    linodeStatus,
    linodeDisks,
    linodeConfigs
  } = props;

  const [powerDialog, setPowerDialog] = React.useState<PowerDialogProps>({
    open: false,
    linodeID: 0,
    linodeLabel: ''
  });

  const [deleteDialog, setDeleteDialog] = React.useState<DialogProps>({
    open: false,
    linodeID: 0,
    linodeLabel: ''
  });

  const [resizeDialog, setResizeDialog] = React.useState<DialogProps>({
    open: isAction('resize'),
    linodeID: matchedLinodeId
  });

  const [migrateDialog, setMigrateDialog] = React.useState<DialogProps>({
    open: isAction('migrate'),
    linodeID: matchedLinodeId
  });

  const [rescueDialog, setRescueDialog] = React.useState<DialogProps>({
    open: isAction('rescue'),
    linodeID: matchedLinodeId
  });

  const [rebuildDialog, setRebuildDialog] = React.useState<DialogProps>({
    open: isAction('rebuild'),
    linodeID: matchedLinodeId
  });

  const [backupsDialog, setBackupsDialog] = React.useState<DialogProps>({
    open: false,
    linodeID: 0
  });

  const [tagDrawer, setTagDrawer] = React.useState<TagDrawerProps>({
    open: false,
    tags: []
  });

  const { updateLinode, deleteLinode } = useLinodes();
  const history = useHistory();

  const openPowerActionDialog = (
    bootAction: BootAction,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => {
    setPowerDialog({
      open: true,
      bootAction,
      linodeConfigs,
      linodeID,
      linodeLabel
    });
  };

  const openDialog = (
    dialogType: DialogType,
    linodeID: number,
    linodeLabel?: string
  ) => {
    switch (dialogType) {
      case 'delete':
        setDeleteDialog(deleteDialog => ({
          ...deleteDialog,
          open: true,
          linodeLabel,
          linodeID
        }));
        break;
      case 'migrate':
        setMigrateDialog(migrateDialog => ({
          ...migrateDialog,
          open: true,
          linodeID
        }));
        break;
      case 'resize':
        setResizeDialog(resizeDialog => ({
          ...resizeDialog,
          open: true,
          linodeID
        }));
        break;
      case 'rescue':
        setRescueDialog(rescueDialog => ({
          ...rescueDialog,
          open: true,
          linodeID
        }));
        break;
      case 'rebuild':
        setRebuildDialog(rebuildDialog => ({
          ...rebuildDialog,
          open: true,
          linodeID
        }));
        break;
      case 'enable_backups':
        setBackupsDialog(backupsDialog => ({
          ...backupsDialog,
          open: true,
          linodeID
        }));
        break;
    }
  };

  const closeDialogs = () => {
    setPowerDialog(powerDialog => ({ ...powerDialog, open: false }));
    setDeleteDialog(deleteDialog => ({ ...deleteDialog, open: false }));
    setResizeDialog(resizeDialog => ({ ...resizeDialog, open: false }));
    setMigrateDialog(migrateDialog => ({ ...migrateDialog, open: false }));
    setRescueDialog(rescueDialog => ({ ...rescueDialog, open: false }));
    setRebuildDialog(rebuildDialog => ({ ...rebuildDialog, open: false }));
    setBackupsDialog(backupsDialog => ({ ...backupsDialog, open: false }));
  };

  const closeTagDrawer = () => {
    setTagDrawer(tagDrawer => ({ ...tagDrawer, open: false }));
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
      setTagDrawer(tagDrawer => ({ ...tagDrawer, tags: _tags }));
    });
  };

  const deleteTag = (linodeId: number, tagToDelete: string) => {
    const _tags = tagDrawer.tags.filter(thisTag => thisTag !== tagToDelete);
    return updateLinode({ linodeId, tags: _tags }).then(_ => {
      setTagDrawer(tagDrawer => ({ ...tagDrawer, tags: _tags }));
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

  const handleDeleteLinode = (linodeId: number) => {
    history.push('/linodes');
    return deleteLinode(linodeId);
  };

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
        openDialog={openDialog}
        openPowerActionDialog={openPowerActionDialog}
      />
      {linodeInTransition(linodeStatus, firstEventWithProgress) && (
        <LinodeBusyStatus />
      )}
      <PowerDialogOrDrawer
        isOpen={powerDialog.open}
        action={powerDialog.bootAction}
        linodeID={powerDialog.linodeID}
        linodeLabel={powerDialog.linodeLabel}
        close={closeDialogs}
        linodeConfigs={powerDialog.linodeConfigs}
      />
      <DeleteDialog
        open={deleteDialog.open}
        onClose={closeDialogs}
        linodeID={deleteDialog.linodeID}
        linodeLabel={deleteDialog.linodeLabel}
        handleDelete={handleDeleteLinode}
      />
      <LinodeResize_CMR
        open={resizeDialog.open}
        onClose={closeDialogs}
        linodeId={resizeDialog.linodeID}
      />
      <LinodeRebuildDialog
        open={rebuildDialog.open}
        onClose={closeDialogs}
        linodeId={rebuildDialog.linodeID}
      />
      <RescueDialog
        open={rescueDialog.open}
        onClose={closeDialogs}
        linodeId={rescueDialog.linodeID}
      />
      <MigrateLinode
        open={migrateDialog.open}
        onClose={closeDialogs}
        linodeID={migrateDialog.linodeID}
      />
      <TagDrawer
        entityLabel={linode.label}
        open={tagDrawer.open}
        tags={tagDrawer.tags}
        addTag={(newTag: string) => addTag(linode.id, newTag)}
        deleteTag={(tag: string) => deleteTag(linode.id, tag)}
        onClose={closeTagDrawer}
      />
      <EnableBackupDialog
        linodeId={backupsDialog.linodeID}
        open={backupsDialog.open}
        onClose={closeDialogs}
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
