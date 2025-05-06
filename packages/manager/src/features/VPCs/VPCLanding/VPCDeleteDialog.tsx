import { useDeleteVPCMutation } from '@linode/queries';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';

import type { APIError, VPC } from '@linode/api-v4';

interface Props {
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
  vpc?: VPC;
  vpcError: APIError[] | null;
}

export const VPCDeleteDialog = (props: Props) => {
  const { isFetching, onClose, open, vpc, vpcError } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isPending,
    mutateAsync: deleteVPC,
    reset,
  } = useDeleteVPCMutation(vpc?.id ?? -1);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onDeleteVPC = () => {
    deleteVPC().then(() => {
      enqueueSnackbar('VPC deleted successfully.', {
        variant: 'success',
      });
      onClose();
      if (location.pathname !== '/vpcs') {
        navigate({ to: '/vpcs' });
      }
    });
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: vpc?.label,
        primaryBtnText: 'Delete',
        type: 'VPC',
        error: vpcError,
      }}
      errors={error}
      expand
      isFetching={isFetching}
      label="VPC Label"
      loading={isPending}
      onClick={onDeleteVPC}
      onClose={onClose}
      open={open}
      title={`Delete VPC ${vpc?.label ?? 'Unknown'}`}
    />
  );
};
