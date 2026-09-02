import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateSubnetMutation, useVPCQuery } from '@linode/queries';
import { ActionsPanel, Drawer, Notice, TextField } from '@linode/ui';
import { modifySubnetSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useIsNATGatewaysEnabled } from 'src/features/NATGateways/utils';
import { NATGatewaySelect } from 'src/features/VPCs/components/NATGatewaySelect';

import type { APIError, ModifySubnetPayload, Subnet } from '@linode/api-v4';

interface Props {
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
  subnet?: Subnet;
  subnetError?: APIError[] | null;
  vpcId: number;
}

const IP_HELPER_TEXT =
  'Once a subnet is created its IP range cannot be edited.';

export const SubnetEditDrawer = (props: Props) => {
  const { isFetching, onClose, open, subnet, subnetError, vpcId } = props;

  const { data: vpc } = useVPCQuery(vpcId, open);

  const {
    isPending,
    mutateAsync: updateSubnet,
    reset: resetMutation,
  } = useUpdateSubnetMutation(vpcId, subnet?.id ?? -1);

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    reset: resetForm,
    setError,
  } = useForm<ModifySubnetPayload & { natgateway?: null | { id: number } }>({
    mode: 'onBlur',
    resolver: yupResolver(modifySubnetSchema),
    values: {
      label: subnet?.label ?? '',
      natgateway:
        (subnet as Subnet & { natgateway?: { id: number } })?.natgateway ??
        undefined,
    },
  });

  const isNATGatewaysEnabled = useIsNATGatewaysEnabled();

  const handleDrawerClose = () => {
    onClose();
    resetForm();
    resetMutation();
  };

  const onSubmit = async (values: ModifySubnetPayload) => {
    try {
      await updateSubnet(values);
      handleDrawerClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };
  // TODO: change 'update_vpc' to 'update_vpc_subnet' once it's available
  const { data: permissions } = usePermissions('vpc', ['update_vpc'], vpcId);

  return (
    <Drawer
      error={subnetError}
      isFetching={isFetching}
      onClose={handleDrawerClose}
      open={open}
      title="Edit Subnet"
    >
      {errors.root?.message && (
        <Notice text={errors.root.message} variant="error" />
      )}
      {!permissions.update_vpc && (
        <Notice
          text={`You don't have permissions to edit ${subnet?.label}. Please contact an account administrator for details.`}
          variant="error"
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="label"
          render={({ field, fieldState }) => (
            <TextField
              disabled={!permissions.update_vpc}
              errorText={fieldState.error?.message}
              label="Label"
              name="label"
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
        <TextField
          disabled
          label="Subnet IP Address Range"
          tooltipText={IP_HELPER_TEXT}
          value={subnet?.ipv4}
        />
        {isNATGatewaysEnabled && (
          <Controller
            control={control}
            name="natgateway"
            render={({ field, fieldState }) => (
              <NATGatewaySelect
                currentSubnetId={subnet?.id}
                dataPendoIdForOption="VPC Details Create Subnet NAT Gateway Options"
                dataPendoIdForSelect="VPC Details Create Subnet NAT Gateway open"
                disabled={!permissions.update_vpc}
                errorText={fieldState.error?.message}
                interfaces={
                  subnet?.linodes?.flatMap((linode) => linode.interfaces) ?? []
                }
                onChange={(natGatewayId) => {
                  field.onChange(
                    natGatewayId !== null ? { id: natGatewayId } : undefined
                  );
                }}
                region={vpc?.region}
                value={field.value?.id ?? null}
              />
            )}
          />
        )}
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'save-button',
            disabled: !isDirty || !permissions.update_vpc,
            label: 'Save',
            loading: isPending || isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: handleDrawerClose }}
        />
      </form>
    </Drawer>
  );
};
