import { Config, Disk, LinodeStatus } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { useHistory, useRouteMatch, useLocation } from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import TagDrawer from 'src/components/TagCell/TagDrawer';
import LinodeEntityDetail from 'src/features/linodes/LinodeEntityDetail';
import PowerDialogOrDrawer, {
  Action as BootAction
} from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import { notificationContext as _notificationContext } from 'src/features/NotificationCenter/NotificationContext';
import useLinodeActions from 'src/hooks/useLinodeActions';
import useProfile from 'src/hooks/useProfile';
import useReduxLoad from 'src/hooks/useReduxLoad';
import useVolumes from 'src/hooks/useVolumes';
import { getVolumesForLinode } from 'src/store/volume/volume.selector';
import DeleteDialog from '../../LinodesLanding/DeleteDialog';
import MigrateLinode from '../../MigrateLanding/MigrateLinode';
import EnableBackupDialog from '../LinodeBackup/EnableBackupsDialog';
import {
  LinodeDetailContext,
  withLinodeDetailContext
} from '../linodeDetailContext';
import LinodeRebuildDialog from '../LinodeRebuild/LinodeRebuildDialog';
import RescueDialog from '../LinodeRescue/RescueDialog';
import LinodeResize_CMR from '../LinodeResize/LinodeResize_CMR';
import HostMaintenance from './HostMaintenance';
import MutationNotification from './MutationNotification';
import Notifications from './Notifications';
import LinodeDetailsBreadcrumb from './LinodeDetailsBreadcrumb';
import { parseQueryParams } from 'src/utilities/queryParams';

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
  // now show their content in modals instead. The logic below facilitates handling
  // modal-related query params (and the older /:subpath routes before the redirect
  // logic changes the URL) to determine if a modal should be open when this component
  // is first rendered.
  const location = useLocation();
  const queryParams = parseQueryParams(location.search);

  const match = useRouteMatch<{ linodeId: string; subpath: string }>({
    path: '/linodes/:linodeId/:subpath'
  });

  const matchedLinodeId = Number(match?.params?.linodeId ?? 0);

  const notificationContext = React.useContext(_notificationContext);

  const { linode, linodeStatus, linodeDisks, linodeConfigs } = props;

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
    open: Boolean(queryParams.resize),
    linodeID: matchedLinodeId
  });

  const [migrateDialog, setMigrateDialog] = React.useState<DialogProps>({
    open: Boolean(queryParams.migrate),
    linodeID: matchedLinodeId
  });

  const [rescueDialog, setRescueDialog] = React.useState<DialogProps>({
    open: Boolean(queryParams.rescue),
    linodeID: matchedLinodeId
  });

  const [rebuildDialog, setRebuildDialog] = React.useState<DialogProps>({
    open: Boolean(queryParams.rebuild),
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

  const { updateLinode, deleteLinode } = useLinodeActions();
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
        history.replace({ search: 'migrate=true' });
        break;
      case 'resize':
        setResizeDialog(resizeDialog => ({
          ...resizeDialog,
          open: true,
          linodeID
        }));
        history.replace({ search: 'resize=true' });
        break;
      case 'rescue':
        setRescueDialog(rescueDialog => ({
          ...rescueDialog,
          open: true,
          linodeID
        }));
        history.replace({ search: 'rescue=true' });
        break;
      case 'rebuild':
        setRebuildDialog(rebuildDialog => ({
          ...rebuildDialog,
          open: true,
          linodeID
        }));
        history.replace({ search: 'rebuild=true' });
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
    // If the user is on a Linode detail tab with the modal open and they then close it,
    // change the URL to reflect just the tab they are on.
    if (
      queryParams.resize ||
      queryParams.rescue ||
      queryParams.rebuild ||
      queryParams.migrate
    ) {
      history.replace({ search: undefined });
    }

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
    <>
      <HostMaintenance linodeStatus={linodeStatus} />
      <MutationNotification disks={linodeDisks} />
      <Notifications />
      <LinodeDetailsBreadcrumb />
      <LinodeEntityDetail
        variant="details"
        id={linode.id}
        linode={linode}
        numVolumes={getVolumesByLinode(linode.id)}
        username={profile.data?.username}
        linodeConfigs={linodeConfigs}
        backups={linode.backups}
        openTagDrawer={openTagDrawer}
        openDialog={openDialog}
        openPowerActionDialog={openPowerActionDialog}
        openNotificationDrawer={notificationContext.openDrawer}
      />
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
        _linode={linode}
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
    </>
  );
};

interface LinodeContext {
  linodeStatus: LinodeStatus;
  linodeDisks: Disk[];
}

export default compose<CombinedProps, {}>(
  withLinodeDetailContext<LinodeContext>(({ linode }) => ({
    linode,
    linodeStatus: linode.status,
    linodeDisks: linode._disks,
    configs: linode._configs
  }))
)(LinodeDetailHeader);
