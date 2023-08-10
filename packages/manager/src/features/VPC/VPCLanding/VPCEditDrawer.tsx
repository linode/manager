import { UpdateVPCPayload, VPC } from '@linode/api-v4/lib/vpcs/types';
import { useFormik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Tooltip } from 'src/components/Tooltip';
import { useRegionsQuery } from 'src/queries/regions';
import { useUpdateVPCMutation } from 'src/queries/vpcs';
import { getErrorMap } from 'src/utilities/errorUtils';

interface Props {
  onClose: () => void;
  open: boolean;
  vpc?: VPC;
}

const REGION_HELPER_TEXT = 'Region cannot be changed during beta.';

export const VPCEditDrawer = (props: Props) => {
  const { onClose, open, vpc } = props;

  const {
    error,
    isLoading,
    mutateAsync: updateVPC,
    reset,
  } = useUpdateVPCMutation(vpc?.id ?? -1);

  const form = useFormik<UpdateVPCPayload>({
    enableReinitialize: true,
    initialValues: {
      description: vpc?.description,
      label: vpc?.label,
    },
    async onSubmit(values) {
      await updateVPC(values);
      onClose();
    },
  });

  React.useEffect(() => {
    if (open) {
      form.resetForm();
      reset();
    }
  }, [open]);

  const { data: regionsData, error: regionsError } = useRegionsQuery();

  const errorMap = getErrorMap(['label', 'description'], error);

  return (
    <Drawer onClose={onClose} open={open} title="Edit VPC">
      {errorMap.none && <Notice error text={errorMap.none} />}
      <form onSubmit={form.handleSubmit}>
        <TextField
          errorText={errorMap.label}
          label="Label"
          name="label"
          onChange={form.handleChange}
          value={form.values.label}
        />
        <TextField
          errorText={errorMap.description}
          label="Description"
          multiline
          onChange={form.handleChange}
          rows={1}
          value={form.values.description}
        />
        {regionsData && (
          <Tooltip title={REGION_HELPER_TEXT}>
            <div>
              <RegionSelect
                errorText={
                  (regionsError && regionsError[0].reason) || undefined
                }
                disabled // the Region field will not be editable during beta
                handleSelection={() => null}
                regions={regionsData}
                selectedID={vpc?.region ?? null}
              />
            </div>
          </Tooltip>
        )}
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'save-button',
            disabled: !form.dirty,
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
