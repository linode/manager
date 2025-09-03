import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateSubnetMutation } from '@linode/queries';
import { ActionsPanel, Drawer, Notice, TextField } from '@linode/ui';
import { modifySubnetSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

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
  } = useForm<ModifySubnetPayload>({
    mode: 'onBlur',
    resolver: yupResolver(modifySubnetSchema),
    values: {
      label: subnet?.label ?? '',
    },
  });

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

  const { data: permissions } = usePermissions(
    'vpc',
    ['update_vpc_subnet'],
    vpcId
  );

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
      {!permissions.update_vpc_subnet && (
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
              disabled={!permissions.update_vpc_subnet}
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
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'save-button',
            disabled: !isDirty || !permissions.update_vpc_subnet,
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
