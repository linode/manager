import { Spacing } from '@akamai/cds-tokens';
import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateVPCMutation } from '@linode/queries';
import { ActionsPanel, Drawer, Notice, TextField } from '@linode/ui';
import { updateVPCSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import { VPCIPv4Ranges } from '../components/VPCIPv4Ranges';
import { useIsCustomVPCIPv4RangesEnabled } from '../utils';

import type { APIError, UpdateVPCPayload, VPC } from '@linode/api-v4';

interface Props {
  isFetching: boolean;
  onClose: () => void;
  open: boolean;
  vpc?: VPC;
  vpcError: APIError[] | null;
}

export const VPCEditDrawer = (props: Props) => {
  const { isFetching, onClose, open, vpc, vpcError } = props;

  const { data: permissions } = usePermissions('vpc', ['update_vpc'], vpc?.id);

  const {
    isPending,
    mutateAsync: updateVPC,
    reset: resetMutation,
  } = useUpdateVPCMutation(vpc?.id ?? -1);
  const { isCustomVPCIPv4RangesEnabled } = useIsCustomVPCIPv4RangesEnabled();

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    reset: resetForm,
    setError,
    trigger,
  } = useForm<UpdateVPCPayload>({
    mode: 'onBlur',
    resolver: yupResolver(updateVPCSchema),
    values: {
      description: vpc?.description ?? '',
      label: vpc?.label ?? '',
      ipv4: vpc?.ipv4 ?? [],
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
      error={vpcError}
      isFetching={isFetching}
      onClose={handleDrawerClose}
      open={open}
      title="Edit VPC"
    >
      {errors.root?.message && (
        <Notice text={errors.root.message} variant="error" />
      )}
      {!permissions.update_vpc && (
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
              data-testid="label"
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
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <TextField
              data-testid="description"
              disabled={!permissions.update_vpc}
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
        {isCustomVPCIPv4RangesEnabled && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              paddingTop: Spacing.S4,
              paddingBottom: Spacing.S12,
            }}
          >
            <Controller
              control={control}
              name="ipv4"
              render={({ field, fieldState }) => (
                <VPCIPv4Ranges
                  disabled={!permissions.update_vpc}
                  error={
                    typeof fieldState.error?.message === 'string'
                      ? fieldState.error.message
                      : undefined
                  }
                  onBlur={field.onBlur}
                  onChange={(ranges) => {
                    field.onChange(ranges);
                    trigger('ipv4');
                  }}
                  optional
                  rangeErrors={(field.value ?? []).map(
                    (_, index) => errors.ipv4?.[index]?.range?.message
                  )}
                  ranges={field.value ?? []}
                />
              )}
            />
          </div>
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
