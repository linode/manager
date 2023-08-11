import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { TagDrawer } from 'src/components/TagCell/TagDrawer';
import { LinodeEntityDetail } from 'src/features/Linodes/LinodeEntityDetail';
import { MigrateLinode } from 'src/features/Linodes/MigrateLinode/MigrateLinode';
import {
  Action,
  PowerActionsDialog,
} from 'src/features/Linodes/PowerActionsDialogOrDrawer';
import { useEditableLabelState } from 'src/hooks/useEditableLabelState';
import {
  useLinodeQuery,
  useLinodeUpdateMutation,
} from 'src/queries/linodes/linodes';
import { sendLinodeCreateFlowDocsClickEvent } from 'src/utilities/analytics';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import { DeleteLinodeDialog } from '../../LinodesLanding/DeleteLinodeDialog';
import { EnableBackupsDialog } from '../LinodeBackup/EnableBackupsDialog';
import { LinodeRebuildDialog } from '../LinodeRebuild/LinodeRebuildDialog';
import { RescueDialog } from '../LinodeRescue/RescueDialog';
import { LinodeResize } from '../LinodeResize/LinodeResize';
import { HostMaintenance } from './HostMaintenance';
import { MutationNotification } from './MutationNotification';
import Notifications from './Notifications';

interface TagDrawerProps {
  open: boolean;
  tags: string[];
}

const LinodeDetailHeader = () => {
  // Several routes that used to have dedicated pages (e.g. /resize, /rescue)
  // now show their content in modals instead. The logic below facilitates handling
  // modal-related query params (and the older /:subpath routes before the redirect
  // logic changes the URL) to determine if a modal should be open when this component
  // is first rendered.
  const location = useLocation();
  const queryParams = getQueryParamsFromQueryString(location.search);

  const match = useRouteMatch<{ linodeId: string; subpath: string }>({
    path: '/linodes/:linodeId/:subpath?',
  });

  const matchedLinodeId = Number(match?.params?.linodeId ?? 0);

  const { data: linode, error, isLoading } = useLinodeQuery(matchedLinodeId);

  const { mutateAsync: updateLinode } = useLinodeUpdateMutation(
    matchedLinodeId
  );

  const [powerAction, setPowerAction] = React.useState<Action>('Reboot');
  const [powerDialogOpen, setPowerDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(
    queryParams.delete === 'true'
  );
  const [rebuildDialogOpen, setRebuildDialogOpen] = React.useState(
    queryParams.rebuild === 'true'
  );
  const [rescueDialogOpen, setRescueDialogOpen] = React.useState(
    queryParams.rescue === 'true'
  );
  const [resizeDialogOpen, setResizeDialogOpen] = React.useState(
    queryParams.resize === 'true'
  );
  const [migrateDialogOpen, setMigrateDialogOpen] = React.useState(
    queryParams.migrate === 'true'
  );
  const [enableBackupsDialogOpen, setEnableBackupsDialogOpen] = React.useState(
    false
  );

  const [tagDrawer, setTagDrawer] = React.useState<TagDrawerProps>({
    open: false,
    tags: [],
  });

  const history = useHistory();

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

    setPowerDialogOpen(false);
    setDeleteDialogOpen(false);
    setResizeDialogOpen(false);
    setMigrateDialogOpen(false);
    setRescueDialogOpen(false);
    setRebuildDialogOpen(false);
    setEnableBackupsDialogOpen(false);
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

  const updateTags = (tags: string[]) => {
    return updateLinode({ tags }).then((_) => {
      setTagDrawer((tagDrawer) => ({ ...tagDrawer, tags }));
    });
  };

  const {
    editableLabelError,
    resetEditableLabel,
    setEditableLabelError,
  } = useEditableLabelState();

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

  return (
    <>
      <HostMaintenance linodeStatus={linode?.status ?? 'running'} />
      <MutationNotification linodeId={matchedLinodeId} />
      <Notifications />
      <ProductInformationBanner bannerLocation="Linodes" important warning />
      <LandingHeader
        breadcrumbProps={{
          onEditHandlers: {
            editableTextTitle: linode?.label ?? '',
            errorText: editableLabelError,
            onCancel: resetEditableLabel,
            onEdit: handleLinodeLabelUpdate,
          },
          pathname: `/linodes/${linode?.label}`,
        }}
        onDocsClick={() => {
          sendLinodeCreateFlowDocsClickEvent('Getting Started');
        }}
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/guides/platform/get-started/"
        title="Create"
      />
      <LinodeEntityDetail
        handlers={handlers}
        id={matchedLinodeId}
        linode={linode}
        openTagDrawer={openTagDrawer}
      />
      <PowerActionsDialog
        action={powerAction ?? 'Reboot'}
        isOpen={powerDialogOpen}
        linodeId={matchedLinodeId}
        onClose={closeDialogs}
      />
      <DeleteLinodeDialog
        linodeId={matchedLinodeId}
        onClose={closeDialogs}
        onSuccess={() => history.replace('/linodes')}
        open={deleteDialogOpen}
      />
      <LinodeResize
        linodeId={matchedLinodeId}
        onClose={closeDialogs}
        open={resizeDialogOpen}
      />
      <LinodeRebuildDialog
        linodeId={matchedLinodeId}
        onClose={closeDialogs}
        open={rebuildDialogOpen}
      />
      <RescueDialog
        linodeId={matchedLinodeId}
        onClose={closeDialogs}
        open={rescueDialogOpen}
      />
      <MigrateLinode
        linodeId={matchedLinodeId}
        onClose={closeDialogs}
        open={migrateDialogOpen}
      />
      <TagDrawer
        entityID={linode?.id}
        entityLabel={linode?.label ?? ''}
        onClose={closeTagDrawer}
        open={tagDrawer.open}
        tags={tagDrawer.tags}
        updateTags={updateTags}
      />
      <EnableBackupsDialog
        linodeId={matchedLinodeId}
        onClose={closeDialogs}
        open={enableBackupsDialogOpen}
      />
    </>
  );
};

export default LinodeDetailHeader;
