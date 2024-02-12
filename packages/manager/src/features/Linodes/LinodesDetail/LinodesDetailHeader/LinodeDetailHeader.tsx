import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

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
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useEditableLabelState } from 'src/hooks/useEditableLabelState';
import { useFlags } from 'src/hooks/useFlags';
import {
  useLinodeQuery,
  useLinodeUpdateMutation,
} from 'src/queries/linodes/linodes';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import { sendLinodeCreateFlowDocsClickEvent } from 'src/utilities/analytics';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import { DeleteLinodeDialog } from '../../LinodesLanding/DeleteLinodeDialog';
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
  const match = useRouteMatch<{ action: string; linodeId: string }>({
    path: '/linodes/:linodeId/:action?',
  });

  const matchedLinodeId = Number(match?.params?.linodeId ?? 0);

  const { data: linode, error, isLoading } = useLinodeQuery(matchedLinodeId);

  const { mutateAsync: updateLinode } = useLinodeUpdateMutation(
    matchedLinodeId
  );

  const flags = useFlags();
  const { account } = useAccountManagement();
  const showVPCs = isFeatureEnabled(
    'VPCs',
    Boolean(flags.vpc),
    account?.capabilities ?? []
  );

  const [powerAction, setPowerAction] = React.useState<Action>('Reboot');
  const [powerDialogOpen, setPowerDialogOpen] = React.useState(false);

  const deleteDialogOpen = match?.params.action === 'delete';

  const rebuildDialogOpen = match?.params.action === 'rebuild';

  const rescueDialogOpen = match?.params.action === 'rescue';

  const resizeDialogOpen = match?.params.action === 'resize';

  const migrateDialogOpen = match?.params.action === 'migrate';

  const [tagDrawer, setTagDrawer] = React.useState<TagDrawerProps>({
    open: false,
    tags: [],
  });

  const history = useHistory();

  const closeDialogs = () => {
    history.replace(`/linodes/${matchedLinodeId}`);
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
    history.replace(`/linodes/${matchedLinodeId}/delete`);
  };

  const onOpenResizeDialog = () => {
    history.replace(`/linodes/${matchedLinodeId}/resize`);
  };

  const onOpenRebuildDialog = () => {
    history.replace(`/linodes/${matchedLinodeId}/rebuild`);
  };

  const onOpenRescueDialog = () => {
    history.replace(`/linodes/${matchedLinodeId}/rescue`);
  };

  const onOpenMigrateDialog = () => {
    history.replace(`/linodes/${matchedLinodeId}/migrate`);
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
      <ProductInformationBanner bannerLocation="Linodes" />
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
        manuallyUpdateConfigs={showVPCs}
        onClose={() => setPowerDialogOpen(false)}
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
    </>
  );
};

export default LinodeDetailHeader;
