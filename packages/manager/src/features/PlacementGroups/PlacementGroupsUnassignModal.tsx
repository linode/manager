import { useUnassignLinodesFromPlacementGroup } from '@linode/queries';
import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';

import type {
  Linode,
  UnassignLinodesFromPlacementGroupPayload,
} from '@linode/api-v4';

interface Props {
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
  selectedLinode: Linode | undefined;
}

export const PlacementGroupsUnassignModal = (props: Props) => {
  const { isFetching, onClose, open, selectedLinode: linode } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { id: placementGroupId, linodeId } = useParams({
    strict: false,
  });

  const {
    error,
    isPending,
    mutateAsync: unassignLinodes,
  } = useUnassignLinodesFromPlacementGroup(
    placementGroupId ? +placementGroupId : -1
  );

  const payload: UnassignLinodesFromPlacementGroupPayload = {
    linodes: [linode?.id ?? -1],
  };

  const onUnassign = async () => {
    await unassignLinodes(payload);
    const toastMessage = linode
      ? `Linode ${linode?.label} successfully unassigned.`
      : 'Linode successfully unassigned.';
    enqueueSnackbar(toastMessage, {
      variant: 'success',
    });
    onClose();
  };

  const isLinodeReadOnly = useIsResourceRestricted({
    grantLevel: 'read_write',
    grantType: 'linode',
    id: linodeId ? linodeId : -1,
  });

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        disabled: isPending || isLinodeReadOnly,
        label: 'Unassign',
        loading: isPending,
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
      actions={actions}
      error={error?.[0]?.reason}
      isFetching={isFetching}
      onClose={onClose}
      open={open}
      title={linode?.label ? `Unassign ${linode.label}` : 'Unassign'}
    >
      {!linode && (
        <Notice
          text="There was a problem retrieving this linode"
          variant="error"
        />
      )}
      <Typography>Are you sure you want to unassign this Linode?</Typography>
    </ConfirmationDialog>
  );
};
