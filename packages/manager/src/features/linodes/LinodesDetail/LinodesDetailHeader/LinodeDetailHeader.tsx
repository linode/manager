import { Config, Disk, LinodeStatus } from '@linode/api-v4/lib/linodes';
import { Volume } from '@linode/api-v4/lib/volumes';
import * as React from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { compose } from 'recompose';
import TagDrawer from 'src/components/TagCell/TagDrawer';
import LinodeEntityDetail from 'src/features/linodes/LinodeEntityDetail';
import PowerDialogOrDrawer, {
  Action as BootAction,
} from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import { notificationContext as _notificationContext } from 'src/features/NotificationCenter/NotificationContext';
import useLinodeActions from 'src/hooks/useLinodeActions';
import useNotifications from 'src/hooks/useNotifications';
import { useProfile } from 'src/queries/profile';
import { useLinodeVolumesQuery } from 'src/queries/volumes';
import { parseQueryParams } from 'src/utilities/queryParams';
import DeleteDialog from '../../LinodesLanding/DeleteDialog';
import MigrateLinode from '../../MigrateLinode';
import EnableBackupDialog from '../LinodeBackup/EnableBackupsDialog';
import {
  LinodeDetailContext,
  withLinodeDetailContext,
} from '../linodeDetailContext';
import LinodeRebuildDialog from '../LinodeRebuild/LinodeRebuildDialog';
import RescueDialog from '../LinodeRescue';
import LinodeResize from '../LinodeResize/LinodeResize';
import HostMaintenance from './HostMaintenance';
import MutationNotification from './MutationNotification';
import Notifications from './Notifications';
import { UpgradeVolumesDialog } from './UpgradeVolumesDialog';
import LandingHeader from 'src/components/LandingHeader';
import { sendEvent } from 'src/utilities/ga';
import useEditableLabelState from 'src/hooks/useEditableLabelState';
import { APIError } from '@linode/api-v4/lib/types';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { ACCESS_LEVELS } from 'src/constants';

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

const LinodeDetailHeader: React.FC<CombinedProps> = (props) => {
  // Several routes that used to have dedicated pages (e.g. /resize, /rescue)
  // now show their content in modals instead. The logic below facilitates handling
  // modal-related query params (and the older /:subpath routes before the redirect
  // logic changes the URL) to determine if a modal should be open when this component
  // is first rendered.
  const location = useLocation();
  const queryParams = parseQueryParams(location.search);

  const match = useRouteMatch<{ linodeId: string; subpath: string }>({
    path: '/linodes/:linodeId/:subpath?',
  });

  const matchedLinodeId = Number(match?.params?.linodeId ?? 0);

  const notifications = useNotifications();

  const notificationContext = React.useContext(_notificationContext);

  const { linode, linodeStatus, linodeDisks, linodeConfigs } = props;

  const [powerDialog, setPowerDialog] = React.useState<PowerDialogProps>({
    open: false,
    linodeID: 0,
    linodeLabel: '',
  });

  const [deleteDialog, setDeleteDialog] = React.useState<DialogProps>({
    open: false,
    linodeID: 0,
    linodeLabel: '',
  });

  const [resizeDialog, setResizeDialog] = React.useState<DialogProps>({
    open: queryParams.resize === 'true',
    linodeID: matchedLinodeId,
  });

  const [migrateDialog, setMigrateDialog] = React.useState<DialogProps>({
    open: queryParams.migrate === 'true',
    linodeID: matchedLinodeId,
  });

  const [rescueDialog, setRescueDialog] = React.useState<DialogProps>({
    open: queryParams.rescue === 'true',
    linodeID: matchedLinodeId,
  });

  const [rebuildDialog, setRebuildDialog] = React.useState<DialogProps>({
    open: queryParams.rebuild === 'true',
    linodeID: matchedLinodeId,
  });

  const [backupsDialog, setBackupsDialog] = React.useState<DialogProps>({
    open: false,
    linodeID: 0,
  });

  const [
    upgradeVolumesDialog,
    setUpgradeVolumesDialog,
  ] = React.useState<DialogProps>({
    open: queryParams.upgrade === 'true',
    linodeID: matchedLinodeId,
  });

  const [tagDrawer, setTagDrawer] = React.useState<TagDrawerProps>({
    open: false,
    tags: [],
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
      linodeLabel,
    });
  };

  const openDialog = (
    dialogType: DialogType,
    linodeID: number,
    linodeLabel?: string
  ) => {
    switch (dialogType) {
      case 'delete':
        setDeleteDialog((deleteDialog) => ({
          ...deleteDialog,
          open: true,
          linodeLabel,
          linodeID,
        }));
        break;
      case 'migrate':
        setMigrateDialog((migrateDialog) => ({
          ...migrateDialog,
          open: true,
          linodeID,
        }));
        history.replace({ search: 'migrate=true' });
        break;
      case 'resize':
        setResizeDialog((resizeDialog) => ({
          ...resizeDialog,
          open: true,
          linodeID,
        }));
        history.replace({ search: 'resize=true' });
        break;
      case 'rescue':
        setRescueDialog((rescueDialog) => ({
          ...rescueDialog,
          open: true,
          linodeID,
        }));
        history.replace({ search: 'rescue=true' });
        break;
      case 'rebuild':
        setRebuildDialog((rebuildDialog) => ({
          ...rebuildDialog,
          open: true,
          linodeID,
        }));
        history.replace({ search: 'rebuild=true' });
        break;
      case 'enable_backups':
        setBackupsDialog((backupsDialog) => ({
          ...backupsDialog,
          open: true,
          linodeID,
        }));
        break;
      case 'upgrade_volumes':
        setUpgradeVolumesDialog((upgradeVolumesDialog) => ({
          ...upgradeVolumesDialog,
          open: true,
        }));
        history.replace({ search: 'upgrade=true' });
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
      queryParams.migrate ||
      queryParams.upgrade
    ) {
      history.replace({ search: undefined });
    }

    setPowerDialog((powerDialog) => ({ ...powerDialog, open: false }));
    setDeleteDialog((deleteDialog) => ({ ...deleteDialog, open: false }));
    setResizeDialog((resizeDialog) => ({ ...resizeDialog, open: false }));
    setMigrateDialog((migrateDialog) => ({ ...migrateDialog, open: false }));
    setRescueDialog((rescueDialog) => ({ ...rescueDialog, open: false }));
    setRebuildDialog((rebuildDialog) => ({ ...rebuildDialog, open: false }));
    setBackupsDialog((backupsDialog) => ({ ...backupsDialog, open: false }));
    setUpgradeVolumesDialog((upgradeVolumesDialog) => ({
      ...upgradeVolumesDialog,
      open: false,
    }));
  };

  const closeTagDrawer = () => {
    setTagDrawer((tagDrawer) => ({ ...tagDrawer, open: false }));
  };

  const openTagDrawer = (tags: string[]) => {
    setTagDrawer({
      open: true,
      tags,
    });
  };

  const updateTags = (linodeId: number, tags: string[]) => {
    return updateLinode({ linodeId, tags }).then((_) => {
      setTagDrawer((tagDrawer) => ({ ...tagDrawer, tags }));
    });
  };

  const { data: profile } = useProfile();
  const { data: volumesData } = useLinodeVolumesQuery(matchedLinodeId);

  const volumesForLinode = volumesData?.data ?? [];
  const numAttachedVolumes = volumesData?.results ?? 0;

  const handleDeleteLinode = (linodeId: number) => {
    history.push('/linodes');
    return deleteLinode(linodeId);
  };

  const upgradeableVolumeIds = notifications
    .filter(
      (notification) =>
        notification.type === 'volume_migration_scheduled' &&
        volumesForLinode.some(
          (volume: Volume) => volume.id === notification?.entity?.id
        )
    )
    // Non null assertion because we assume that these kinds of notifications will always have an entity attached.
    .map((notification) => notification.entity!.id);

  const {
    editableLabelError,
    setEditableLabelError,
    resetEditableLabel,
  } = useEditableLabelState();
  const disabled = linode._permissions === ACCESS_LEVELS.readOnly;

  const updateLinodeLabel = async (linodeId: number, label: string) => {
    try {
      await updateLinode({ linodeId, label });
    } catch (updateError) {
      const errors: APIError[] = getAPIErrorOrDefault(
        updateError,
        'An error occurred while updating label',
        'label'
      );
      const errorReasons: string[] = errors.map((error) => error.reason);
      throw new Error(errorReasons[0]);
    }
  };

  const handleLinodeLabelUpdate = (label: string) => {
    const linodeId = linode.id;
    return updateLinodeLabel(linodeId, label)
      .then(() => {
        resetEditableLabel();
      })
      .catch((updateError) => {
        const errorReasons: string[] = [updateError.message];
        setEditableLabelError(errorReasons[0]);
        scrollErrorIntoView();
        return Promise.reject(errorReasons[0]);
      });
  };

  return (
    <>
      <HostMaintenance linodeStatus={linodeStatus} />
      <MutationNotification disks={linodeDisks} />
      <Notifications />
      <LandingHeader
        title="Create"
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/guides/platform/get-started/"
        breadcrumbProps={{
          pathname: `/linodes/${linode.label}`,
          onEditHandlers: !disabled
            ? {
                editableTextTitle: linode.label,
                onEdit: handleLinodeLabelUpdate,
                onCancel: resetEditableLabel,
                errorText: editableLabelError,
              }
            : undefined,
        }}
        onDocsClick={() => {
          sendEvent({
            category: 'Linode Create Flow',
            action: 'Click:link',
            label: 'Getting Started',
          });
        }}
      />
      <LinodeEntityDetail
        id={linode.id}
        linode={linode}
        numVolumes={numAttachedVolumes}
        username={profile?.username}
        linodeConfigs={linodeConfigs}
        backups={linode.backups}
        openTagDrawer={openTagDrawer}
        openDialog={openDialog}
        openPowerActionDialog={openPowerActionDialog}
        openNotificationMenu={notificationContext.openMenu}
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
      <LinodeResize
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
        updateTags={(tags) => updateTags(linode.id, tags)}
        onClose={closeTagDrawer}
      />
      <EnableBackupDialog
        linodeId={backupsDialog.linodeID}
        open={backupsDialog.open}
        onClose={closeDialogs}
      />
      <UpgradeVolumesDialog
        open={upgradeVolumesDialog.open}
        linode={linode}
        upgradeableVolumeIds={upgradeableVolumeIds}
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
    configs: linode._configs,
  }))
)(LinodeDetailHeader);
