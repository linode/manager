import { yupResolver } from '@hookform/resolvers/yup';
import { Notice, TextField } from '@linode/ui';
import { modifySubnetSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { useGrants, useProfile } from 'src/queries/profile/profile';
import { useUpdateSubnetMutation } from 'src/queries/vpcs/vpcs';

import type { ModifySubnetPayload, Subnet } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  subnet?: Subnet;
  vpcId: number;
}

const IP_HELPER_TEXT =
  'Once a subnet is created its IP range cannot be edited.';

export const SubnetEditDrawer = (props: Props) => {
  const { onClose, open, subnet, vpcId } = props;

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

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const vpcPermissions = grants?.vpc.find((v) => v.id === vpcId);

  // there isn't a 'view VPC/Subnet' grant that does anything, so all VPCs get returned even for restricted users
  // with permissions set to 'None'. Therefore, we're treating those as read_only as well
  const readOnly =
    Boolean(profile?.restricted) &&
    (vpcPermissions?.permissions === 'read_only' || grants?.vpc.length === 0);

  return (
    <Drawer onClose={handleDrawerClose} open={open} title="Edit Subnet">
      {errors.root?.message && (
        <Notice text={errors.root.message} variant="error" />
      )}
      {readOnly && (
        <Notice
          important
          text={`You don't have permissions to edit ${subnet?.label}. Please contact an account administrator for details.`}
          variant="error"
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          render={({ field, fieldState }) => (
            <TextField
              disabled={readOnly}
              errorText={fieldState.error?.message}
              label="Label"
              name="label"
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value}
            />
          )}
          control={control}
          name="label"
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
            disabled: !isDirty || readOnly,
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
