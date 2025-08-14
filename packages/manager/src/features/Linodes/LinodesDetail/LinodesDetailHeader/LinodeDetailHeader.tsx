import { useLinodeQuery, useLinodeUpdateMutation } from '@linode/queries';
import { useAllAccountMaintenanceQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { scrollErrorIntoView, useEditableLabelState } from '@linode/utilities';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { PENDING_MAINTENANCE_FILTER } from 'src/features/Account/Maintenance/utilities';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { LinodeEntityDetail } from 'src/features/Linodes/LinodeEntityDetail';
import { MigrateLinode } from 'src/features/Linodes/MigrateLinode/MigrateLinode';
import { PowerActionsDialog } from 'src/features/Linodes/PowerActionsDialogOrDrawer';
import {
  sendEditBreadcrumbEvent,
  sendLinodeCreateFlowDocsClickEvent,
  sendUpdateLinodeLabelEvent,
} from 'src/utilities/analytics/customEventAnalytics';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { addMaintenanceToLinodes } from 'src/utilities/linodes';

import { DeleteLinodeDialog } from '../../LinodesLanding/DeleteLinodeDialog';
import { EnableBackupsDialog } from '../LinodeBackup/EnableBackupsDialog';
import { LinodeRebuildDialog } from '../LinodeRebuild/LinodeRebuildDialog';
import { RescueDialog } from '../LinodeRescue/RescueDialog';
import { LinodeResize } from '../LinodeResize/LinodeResize';
import { VolumesUpgradeBanner } from '../VolumesUpgradeBanner';
import { HostMaintenance } from './HostMaintenance';
import { MutationNotification } from './MutationNotification';
import Notifications from './Notifications';
import { UpgradeVolumesDialog } from './UpgradeVolumesDialog';

import type { APIError } from '@linode/api-v4/lib/types';
import type { Action } from 'src/features/Linodes/PowerActionsDialogOrDrawer';

export const LinodeDetailHeader = () => {
  // Several routes that used to have dedicated pages (e.g. /resize, /rescue)
  // now show their content in modals instead. The logic below facilitates handling
  // modal-related query params (and the older /:subpath routes before the redirect
  // logic changes the URL) to determine if a modal should be open when this component
  // is first rendered.
  const search = useSearch({ from: '/linodes/$linodeId' });
  const navigate = useNavigate();

  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const matchedLinodeId = Number(linodeId ?? 0);

  const { data: linode, error, isLoading } = useLinodeQuery(matchedLinodeId);

  const { data: accountMaintenanceData } = useAllAccountMaintenanceQuery(
    {},
    PENDING_MAINTENANCE_FILTER
  );

  const { mutateAsync: updateLinode } =
    useLinodeUpdateMutation(matchedLinodeId);

  const { data: permissions } = usePermissions(
    'linode',
    ['update_linode'],
    linodeId
  );
  const [powerAction, setPowerAction] = React.useState<Action>('Reboot');
  const [powerDialogOpen, setPowerDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(search.delete);
  const [rebuildDialogOpen, setRebuildDialogOpen] = React.useState(
    search.rebuild
  );
  const [rescueDialogOpen, setRescueDialogOpen] = React.useState(search.rescue);
  const [resizeDialogOpen, setResizeDialogOpen] = React.useState(search.resize);
  const [migrateDialogOpen, setMigrateDialogOpen] = React.useState(
    search.migrate
  );
  const [enableBackupsDialogOpen, setEnableBackupsDialogOpen] =
    React.useState(false);
  const isUpgradeVolumesDialogOpen = search.upgrade;

  const closeDialogs = () => {
    // If the user is on a Linode detail tab with the modal open and they then close it,
    // change the URL to reflect just the tab they are on.
    if (
      search.resize ||
      search.rescue ||
      search.rebuild ||
      search.migrate ||
      search.upgrade
    ) {
      navigate({ search: undefined });
    }

    setPowerDialogOpen(false);
    setDeleteDialogOpen(false);
    setResizeDialogOpen(false);
    setMigrateDialogOpen(false);
    setRescueDialogOpen(false);
    setRebuildDialogOpen(false);
    setEnableBackupsDialogOpen(false);
  };

  const { editableLabelError, resetEditableLabel, setEditableLabelError } =
    useEditableLabelState();

  const updateLinodeLabel = async (label: string) => {
    try {
      await updateLinode({ label });
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
    return updateLinodeLabel(label)
      .then(() => {
        resetEditableLabel();
        sendUpdateLinodeLabelEvent('Breadcrumb');
      })
      .catch((updateError) => {
        const errorReasons: string[] = [updateError.message];
        setEditableLabelError(errorReasons[0]);
        scrollErrorIntoView();
        return Promise.reject(errorReasons[0]);
      });
  };

  const onOpenPowerDialog = (action: Action) => {
    setPowerDialogOpen(true);
    setPowerAction(action);
  };

  const onOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const onOpenResizeDialog = () => {
    setResizeDialogOpen(true);
  };

  const onOpenRebuildDialog = () => {
    setRebuildDialogOpen(true);
  };

  const onOpenRescueDialog = () => {
    setRescueDialogOpen(true);
  };

  const onOpenMigrateDialog = () => {
    setMigrateDialogOpen(true);
  };

  const handlers = {
    onOpenDeleteDialog,
    onOpenMigrateDialog,
    onOpenPowerDialog,
    onOpenRebuildDialog,
    onOpenRescueDialog,
    onOpenResizeDialog,
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error?.[0]?.reason} />;
  }

  if (!linode) {
    return null;
  }

  // Combine linode with maintenance data
  const linodeWithMaintenance = addMaintenanceToLinodes(
    accountMaintenanceData ?? [],
    [linode]
  )[0];

  return (
    <>
      <HostMaintenance linodeStatus={linode.status} />
      <MutationNotification linodeId={matchedLinodeId} />
      <Notifications />
      <VolumesUpgradeBanner linodeId={linode.id} />
      <ProductInformationBanner bannerLocation="Linodes" />
      <LandingHeader
        breadcrumbProps={{
          onEditHandlers: {
            editableTextTitle: linode.label,
            errorText: editableLabelError,
            handleAnalyticsEvent: () => sendEditBreadcrumbEvent(),
            onCancel: resetEditableLabel,
            onEdit: handleLinodeLabelUpdate,
          },
          pathname: `/linodes/${linode.label}`,
        }}
        disabledBreadcrumbEditButton={!permissions.update_linode}
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started"
        onDocsClick={() => {
          sendLinodeCreateFlowDocsClickEvent('Getting Started');
        }}
        title="Create"
      />
      <LinodeEntityDetail
        handlers={handlers}
        id={matchedLinodeId}
        linode={linodeWithMaintenance}
      />
      <PowerActionsDialog
        action={powerAction}
        isOpen={powerDialogOpen}
        linodeId={matchedLinodeId}
        linodeLabel={linode.label}
        onClose={closeDialogs}
      />
      <DeleteLinodeDialog
        linodeId={matchedLinodeId}
        linodeLabel={linode.label}
        onClose={closeDialogs}
        onSuccess={() => navigate({ to: '/linodes' })}
        open={Boolean(deleteDialogOpen)}
      />
      <LinodeResize
        linodeId={matchedLinodeId}
        linodeLabel={linode.label}
        onClose={closeDialogs}
        open={Boolean(resizeDialogOpen)}
      />
      <LinodeRebuildDialog
        linodeId={matchedLinodeId}
        linodeLabel={linode.label}
        onClose={closeDialogs}
        open={Boolean(rebuildDialogOpen)}
      />
      <RescueDialog
        linodeId={matchedLinodeId}
        linodeLabel={linode.label}
        onClose={closeDialogs}
        open={Boolean(rescueDialogOpen)}
      />
      <MigrateLinode
        linodeId={matchedLinodeId}
        onClose={closeDialogs}
        open={Boolean(migrateDialogOpen)}
      />
      <UpgradeVolumesDialog
        linode={linode}
        onClose={closeDialogs}
        open={Boolean(isUpgradeVolumesDialogOpen)}
      />
      <EnableBackupsDialog
        linodeId={matchedLinodeId}
        onClose={closeDialogs}
        open={enableBackupsDialogOpen}
      />
    </>
  );
};
