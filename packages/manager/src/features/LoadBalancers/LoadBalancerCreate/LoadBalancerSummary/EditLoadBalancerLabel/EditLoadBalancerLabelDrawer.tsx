import { useFormikContext } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { TextField } from 'src/components/TextField';

import type { CreateLoadbalancerPayload } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const EditLoadBalancerLabelDrawer = (props: Props) => {
  const { onClose: handleClose, open } = props;

  const {
    errors,
    handleBlur,
    handleChange,
    touched,
    values,
  } = useFormikContext<CreateLoadbalancerPayload>();

  return (
    <Drawer onClose={handleClose} open={open} title="Edit Load Balancer Label">
      <TextField
        disabled={false}
        errorText={touched.label && errors.label ? errors.label : undefined} // Display errors if the field is touched and there's an error
        label="Load Balancer Label"
        name="label"
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="Enter a label"
        value={values?.label}
      />

      <ActionsPanel
        primaryButtonProps={{
          label: 'Save Changes',
          onClick: errors.label ? undefined : handleClose,
          type: 'button',
        }}
        secondaryButtonProps={{
          label: 'Cancel',
          onClick: handleClose,
        }}
      />
    </Drawer>
  );
};
