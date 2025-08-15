import { useDeleteDomainMutation } from '@linode/queries';
import { Notice, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';

import type { APIError } from '@linode/api-v4';
export interface DeleteDomainProps {
  domainError: APIError[] | null;
  domainId?: number;
  domainLabel?: string;
  isFetching: boolean;
  onClose?: () => void;
  // Function that is invoked after Domain has been successfully deleted.
  onSuccess?: () => void;
  open: boolean;
}

export const DeleteDomainDialog = (props: DeleteDomainProps) => {
  const { domainError, domainId, domainLabel, open, onClose, isFetching } =
    props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isPending,
    mutateAsync: deleteDomain,
  } = useDeleteDomainMutation(domainId ?? 0);

  const onDelete = () => {
    deleteDomain().then(() => {
      enqueueSnackbar('Domain deleted successfully.', {
        variant: 'success',
      });
      if (props.onSuccess) {
        props.onSuccess();
      }
    });
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        error: domainError,
        name: domainLabel,
        primaryBtnText: 'Delete Domain',
        type: 'Domain',
      }}
      errors={error}
      isFetching={isFetching}
      label="Domain Name"
      loading={isPending}
      onClick={onDelete}
      onClose={onClose}
      open={open}
      title={`Delete Domain${domainLabel ? ` ${domainLabel}` : ''}?`}
    >
      <Notice variant="warning">
        <Typography>
          <strong>Warning:</strong> Deleting this domain is permanent and can’t
          be undone.
        </Typography>
      </Notice>
    </TypeToConfirmDialog>
  );
};
