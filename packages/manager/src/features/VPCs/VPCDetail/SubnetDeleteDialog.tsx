import { Subnet } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useDeleteSubnetMutation } from 'src/queries/vpcs';

interface Props {
  onClose: () => void;
  open: boolean;
  subnet?: Subnet;
  vpcId: number;
}

export const SubnetDeleteDialog = (props: Props) => {
  const { onClose, open, subnet, vpcId } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isLoading,
    mutateAsync: deleteSubnet,
    reset,
  } = useDeleteSubnetMutation(vpcId, subnet?.id ?? -1);

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onDeleteSubnet = async () => {
    await deleteSubnet();
    enqueueSnackbar('Subnet deleted successfully.', {
      variant: 'success',
    });
    onClose();
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: subnet?.label,
        primaryBtnText: 'Delete',
        type: 'Subnet',
      }}
      errors={error}
      label="Subnet Label"
      loading={isLoading}
      onClick={onDeleteSubnet}
      onClose={onClose}
      open={open}
      title={`Delete Subnet ${subnet?.label}`}
    />
  );
};
