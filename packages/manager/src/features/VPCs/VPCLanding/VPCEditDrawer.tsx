import { yupResolver } from '@hookform/resolvers/yup';
import { Notice, TextField } from '@linode/ui';
import { updateVPCSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useGrants, useProfile } from 'src/queries/profile/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useUpdateVPCMutation } from 'src/queries/vpcs/vpcs';

import type { UpdateVPCPayload, VPC } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  vpc?: VPC;
}

const REGION_HELPER_TEXT = 'Region cannot be changed during beta.';

export const VPCEditDrawer = (props: Props) => {
  const { onClose, open, vpc } = props;

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
      description: vpc?.description,
      label: vpc?.label,
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

  const { data: regionsData, error: regionsError } = useRegionsQuery();

  return (
    <Drawer onClose={handleDrawerClose} open={open} title="Edit VPC">
      {errors.root?.message && (
        <Notice text={errors.root.message} variant="error" />
      )}
      {readOnly && (
        <Notice
          important
          text={`You don't have permissions to edit ${vpc?.label}. Please contact an account administrator for details.`}
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
        <Controller
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
          control={control}
          name="description"
        />
        {regionsData && (
          <RegionSelect
            currentCapability="VPCs"
            disabled // the Region field will not be editable during beta
            errorText={(regionsError && regionsError[0].reason) || undefined}
            helperText={REGION_HELPER_TEXT}
            onChange={() => null}
            regions={regionsData}
            value={vpc?.region}
          />
        )}
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
