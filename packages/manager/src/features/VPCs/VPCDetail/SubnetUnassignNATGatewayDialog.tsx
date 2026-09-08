import { useUpdateSubnetMutation } from '@linode/queries';
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

export const SubnetUnassignNATGatewayDialog = (props: Props) => {
  const { isFetching, onClose, open, subnet, subnetError, vpcId } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isPending,
    mutateAsync: updateSubnet,
    reset,
  } = useUpdateSubnetMutation(vpcId, subnet?.id ?? -1);

  // TODO: change 'update_vpc' to 'update_vpc_subnet' once it's available
  const { data: permissions } = usePermissions('vpc', ['update_vpc'], vpcId);

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const natGatewayLabel = subnet?.natgateway?.label ?? '';

  const onUnassignNATGateway = async () => {
    await updateSubnet({
      label: subnet?.label ?? '',
      natgateway: { id: null },
    });
    enqueueSnackbar('NAT Gateway unassigned successfully.', {
      variant: 'success',
    });
    onClose();
  };

  return (
    <TypeToConfirmDialog
      closeIconPendoId="VPC Details Subnets Unassign NAT Gateway-Close"
      disableTypeToConfirmInput={!permissions?.update_vpc}
      entity={{
        action: 'unassignment',
        error: subnetError,
        name: natGatewayLabel,
        primaryBtnText: 'Unassign NAT Gateway',
        type: 'NAT Gateway',
      }}
      errors={error}
      expand
      isFetching={isFetching}
      label="NAT Gateway Name"
      loading={isPending}
      onClick={onUnassignNATGateway}
      onClose={onClose}
      open={open}
      primaryButtonProps={{
        'data-pendo-id':
          'VPC Details Subnets Unassign NAT Gateway-Unassign NAT Gateway End Flow',
      }}
      secondaryButtonProps={{
        label: 'Cancel',
        'data-pendo-id': 'VPC Details Subnets Unassign NAT Gateway-Cancel',
      }}
      title={`Unassign ${natGatewayLabel}?`}
    >
      {!permissions?.update_vpc && (
        <Notice
          text={`You don't have permissions to unassign the NAT Gateway from ${subnet?.label}. Please contact an account administrator for details.`}
          variant="error"
        />
      )}
    </TypeToConfirmDialog>
  );
};
