import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useDeleteSubnetMutation } from 'src/queries/vpcs';

interface Props {
  onClose: () => void;
  open: boolean;
  subnetID?: number;
  subnetLabel: string;
  vpcID: number;
}

export const SubnetDeleteDialog = (props: Props) => {
  const { onClose, open, subnetID, subnetLabel, vpcID } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isLoading,
    mutateAsync: deleteSubnet,
  } = useDeleteSubnetMutation(vpcID, subnetID ?? -1);
  const history = useHistory();

  const onDeleteSubnet = async () => {
    await deleteSubnet();
    enqueueSnackbar('Subnet deleted successfully.', {
      variant: 'success',
    });
    onClose();
    if (history.location.pathname !== `/vpcs/${vpcID}`) {
      history.push(`/vpcs/${vpcID}`);
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
      title={`Delete subnet ${subnetLabel}`}
    />
  );
};
