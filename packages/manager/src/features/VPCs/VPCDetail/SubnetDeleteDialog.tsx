import { useDeleteSubnetMutation } from '@linode/queries';
import { Notice } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { APIError, Subnet } from '@linode/api-v4';

interface Props {
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
  subnet?: Subnet;
  subnetError?: APIError[] | null;
  vpcId: number;
}

export const SubnetDeleteDialog = (props: Props) => {
  const { isFetching, onClose, open, subnet, subnetError, vpcId } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isPending,
    mutateAsync: deleteSubnet,
    reset,
  } = useDeleteSubnetMutation(vpcId, subnet?.id ?? -1);

  const { data: permissions } = usePermissions(
    'vpc',
    ['delete_vpc_subnet'],
    vpcId
  );

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
      disableTypeToConfirmInput={!permissions.delete_vpc_subnet}
      entity={{
        action: 'deletion',
        name: subnet?.label,
        primaryBtnText: 'Delete',
        type: 'Subnet',
        error: subnetError,
      }}
      errors={error}
      expand
      isFetching={isFetching}
      label="Subnet Label"
      loading={isPending}
      onClick={onDeleteSubnet}
      onClose={onClose}
      open={open}
      title={`Delete Subnet ${subnet?.label}`}
    >
      {!permissions.delete_vpc_subnet && (
        <Notice
          text={`You don't have permissions to delete ${subnet?.label}. Please contact an account administrator for details.`}
          variant="error"
        />
      )}
    </TypeToConfirmDialog>
  );
};
