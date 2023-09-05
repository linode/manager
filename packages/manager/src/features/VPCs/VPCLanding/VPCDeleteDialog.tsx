import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useDeleteVPCMutation } from 'src/queries/vpcs';

interface Props {
  id?: number;
  label?: string;
  onClose: () => void;
  open: boolean;
}

export const VPCDeleteDialog = (props: Props) => {
  const { id, label, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { error, isLoading, mutateAsync: deleteVPC } = useDeleteVPCMutation(
    id ?? -1
  );
  const history = useHistory();

  const onDeleteVPC = () => {
    deleteVPC().then(() => {
      enqueueSnackbar('VPC deleted successfully.', {
        variant: 'success',
      });
      onClose();
      if (history.location.pathname !== '/vpcs') {
        history.push('/vpcs');
      }
    });
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: label,
        primaryBtnText: 'Delete',
        type: 'VPC',
      }}
      errors={error}
      label="VPC Label"
      loading={isLoading}
      onClick={onDeleteVPC}
      onClose={onClose}
      open={open}
      title={`Delete VPC ${label}`}
    />
  );
};
