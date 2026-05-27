import {
  useDeleteShareGroupMutation,
  useShareGroupQuery,
} from '@linode/queries';
import { useSnackbar } from 'notistack';
import React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';

import { DELETE_SHARE_GROUP_PENDO_IDS } from '../constants';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
  shareGroupId: string | undefined;
}

export const DeleteShareGroupDialog = (props: Props) => {
  const { shareGroupId, open, onClose, onSuccess } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: shareGroup,
    isLoading,
    error,
  } = useShareGroupQuery(shareGroupId ?? '', !!shareGroupId);

  const { mutate: deleteShareGroup, isPending } = useDeleteShareGroupMutation({
    onSuccess() {
      enqueueSnackbar('Share group deleted successfully.', {
        variant: 'success',
      });
      onSuccess();
    },
  });

  return (
    <TypeToConfirmDialog
      closeIconPendoId={DELETE_SHARE_GROUP_PENDO_IDS.xButton}
      entity={{
        type: 'Share Group',
        primaryBtnText: 'Delete',
        action: 'deletion',
        name: shareGroup?.label ?? '',
      }}
      errors={error}
      expand
      isFetching={isLoading}
      label="Share Group Label"
      loading={isPending}
      onClick={() => deleteShareGroup({ shareGroupId: shareGroupId ?? '' })}
      onClose={onClose}
      open={open}
      preferencesLinkPendoId={DELETE_SHARE_GROUP_PENDO_IDS.preferencesLink}
      primaryButtonProps={{
        'data-pendo-id': DELETE_SHARE_GROUP_PENDO_IDS.deleteButton,
      }}
      secondaryButtonProps={{
        label: 'Cancel',
        'data-pendo-id': DELETE_SHARE_GROUP_PENDO_IDS.cancelButton,
      }}
      title={`Delete ${shareGroup?.label ?? ''}`}
    />
  );
};
