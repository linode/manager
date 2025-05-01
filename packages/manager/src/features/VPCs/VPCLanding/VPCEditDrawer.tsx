import { yupResolver } from '@hookform/resolvers/yup';
import { useGrants, useProfile, useUpdateVPCMutation } from '@linode/queries';
import { ActionsPanel, Drawer, Notice, TextField } from '@linode/ui';
import { updateVPCSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { UpdateVPCPayload, VPC } from '@linode/api-v4';

interface Props {
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
  vpc?: VPC;
}

export const VPCEditDrawer = (props: Props) => {
  const { isFetching, onClose, open, vpc } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const vpcPermissions = grants?.vpc.find((v) => v.id === vpc?.id);

  // there isn't a 'view VPC/Subnet' grant that does anything, so all VPCs get returned even for restricted users
  // with permissions set to 'None'. Therefore, we're treating those as read_only as well
  const readOnly =
    Boolean(profile?.restricted) &&
    (vpcPermissions?.permissions === 'read_only' || grants?.vpc.length === 0);

  const {
    isPending,
    mutateAsync: updateVPC,
    reset: resetMutation,
  } = useUpdateVPCMutation(vpc?.id ?? -1);

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    reset: resetForm,
    setError,
  } = useForm<UpdateVPCPayload>({
    mode: 'onBlur',
    resolver: yupResolver(updateVPCSchema),
    values: {
      description: vpc?.description ?? '',
      label: vpc?.label ?? '',
    },
  });

  const handleDrawerClose = () => {
    onClose();
    resetForm();
    resetMutation();
  };

  const onSubmit = async (values: UpdateVPCPayload) => {
    try {
      await updateVPC(values);
      handleDrawerClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  return (
    <Drawer
      isFetching={isFetching}
      onClose={handleDrawerClose}
      open={open}
      title="Edit VPC"
    >
      {errors.root?.message && (
        <Notice text={errors.root.message} variant="error" />
      )}
      {readOnly && (
        <Notice
          text={`You don't have permissions to edit ${vpc?.label}. Please contact an account administrator for details.`}
          variant="error"
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="label"
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
        />
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <TextField
              disabled={readOnly}
              errorText={fieldState.error?.message}
              label="Description"
              multiline
              onBlur={field.onBlur}
              onChange={field.onChange}
              rows={1}
              value={field.value}
            />
          )}
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
