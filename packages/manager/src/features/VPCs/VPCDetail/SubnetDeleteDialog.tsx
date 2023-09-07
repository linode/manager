import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useDeleteSubnetMutation } from 'src/queries/vpcs';

interface Props {
  onClose: () => void;
  open: boolean;
  subnetId?: number;
  subnetLabel?: string;
  vpcId: number;
}

export const SubnetDeleteDialog = (props: Props) => {
  const { onClose, open, subnetId, subnetLabel, vpcId } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isLoading,
    mutateAsync: deleteSubnet,
  } = useDeleteSubnetMutation(vpcId, subnetId ?? -1);
  const history = useHistory();

  const onDeleteSubnet = async () => {
    await deleteSubnet();
    enqueueSnackbar('Subnet deleted successfully.', {
      variant: 'success',
    });
    onClose();
    if (history.location.pathname !== `/vpcs/${vpcId}`) {
      history.push(`/vpcs/${vpcId}`);
    }
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: subnetLabel,
        primaryBtnText: 'Delete',
        type: 'Subnet',
      }}
      errors={error}
      label="Subnet label"
      loading={isLoading}
      onClick={onDeleteSubnet}
      onClose={onClose}
      open={open}
      title={`Delete Subnet ${subnetLabel}`}
    />
  );
};
