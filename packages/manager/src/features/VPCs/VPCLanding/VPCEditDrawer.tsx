import { updateVPCSchema } from '@linode/validation/lib/vpcs.schema';
import { useFormik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { TextField } from 'src/components/TextField';
import { useGrants, useProfile } from 'src/queries/profile/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useUpdateVPCMutation } from 'src/queries/vpcs/vpcs';
import { getErrorMap } from 'src/utilities/errorUtils';

import type { UpdateVPCPayload, VPC } from '@linode/api-v4/lib/vpcs/types';

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
    error,
    isLoading,
    mutateAsync: updateVPC,
    reset,
  } = useUpdateVPCMutation(vpc?.id ?? -1);

  interface UpdateVPCPayloadWithNone extends UpdateVPCPayload {
    none?: string;
  }

  const form = useFormik<UpdateVPCPayloadWithNone>({
    enableReinitialize: true,
    initialValues: {
      description: vpc?.description,
      label: vpc?.label,
    },
    async onSubmit(values) {
      await updateVPC(values);
      onClose();
    },
    validateOnChange: false,
    validationSchema: updateVPCSchema,
  });

  const handleFieldChange = (field: string, value: string) => {
    form.setFieldValue(field, value);
    if (form.errors[field]) {
      form.setFieldError(field, undefined);
    }
  };

  React.useEffect(() => {
    if (open) {
      form.resetForm();
      reset();
    }
  }, [open]);

  // If there's an error, sync it with formik
  React.useEffect(() => {
    if (error) {
      const errorMap = getErrorMap(['label', 'description'], error);
      for (const [field, reason] of Object.entries(errorMap)) {
        form.setFieldError(field, reason);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const { data: regionsData, error: regionsError } = useRegionsQuery();

  return (
    <Drawer onClose={onClose} open={open} title="Edit VPC">
      {form.errors.none && <Notice text={form.errors.none} variant="error" />}
      {readOnly && (
        <Notice
          important
          text={`You don't have permissions to edit ${vpc?.label}. Please contact an account administrator for details.`}
          variant="error"
        />
      )}
      <form onSubmit={form.handleSubmit}>
        <TextField
          disabled={readOnly}
          errorText={form.errors.label}
          label="Label"
          name="label"
          onChange={(e) => handleFieldChange('label', e.target.value)}
          value={form.values.label}
        />
        <TextField
          disabled={readOnly}
          errorText={form.errors.description}
          label="Description"
          multiline
          onChange={(e) => handleFieldChange('description', e.target.value)}
          rows={1}
          value={form.values.description}
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
            disabled: !form.dirty || readOnly,
            label: 'Save',
            loading: isLoading,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};
