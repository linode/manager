import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useUnassignLinodesFromPlacementGroup } from 'src/queries/placementGroups';

import type { UnassignLinodesFromPlacementGroupPayload } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const PlacementGroupsUnassignModal = (props: Props) => {
  const { onClose, open } = props;
  const { id: placementGroupId, linodeId } = useParams<{
    id: string;
    linodeId: string;
  }>();

  const {
    error,
    isLoading,
    mutateAsync: unassignLinodes,
  } = useUnassignLinodesFromPlacementGroup(+placementGroupId ?? -1);

  const { enqueueSnackbar } = useSnackbar();

  const { data: selectedLinode } = useLinodeQuery(
    +linodeId ?? -1,
    Boolean(linodeId)
  );

  const payload: UnassignLinodesFromPlacementGroupPayload = {
    linodes: [+linodeId ?? -1],
  };

  const onUnassign = async () => {
    await unassignLinodes(payload);
    const toastMessage = 'Linode successfully unassigned';
    enqueueSnackbar(toastMessage, {
      variant: 'success',
    });
    onClose();
  };

  const isAllowedToEditPlacementGroup = useIsResourceRestricted({
    grantLevel: 'read_write',
    grantType: 'linode',
    id: +linodeId,
  });

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        disabled: isLoading || !isAllowedToEditPlacementGroup,
        label: 'Unassign',
        loading: isLoading,
        onClick: onUnassign,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: onClose,
      }}
    />
  );

  return (
    <ConfirmationDialog
      title={
        selectedLinode?.label ? `Unassign ${selectedLinode.label}` : 'Unassign'
      }
      actions={actions}
      error={error?.[0]?.reason}
      onClose={onClose}
      open={open}
    >
      {!selectedLinode && (
        <Notice
          text="There was a problem retrieving this linode"
          variant="error"
        />
      )}
      <Typography>Are you sure you want to remove this Linode?</Typography>
    </ConfirmationDialog>
  );
};
