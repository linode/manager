import { getIn, useFormikContext } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { TextField } from 'src/components/TextField';

import type { CreateLoadbalancerPayload } from '@linode/api-v4';

interface Props {
  configIndex: number;
  onClose: () => void;
  open: boolean;
  routeIndex: number;
}

export const EditRouteDrawer = (props: Props) => {
  const { configIndex, onClose: handleClose, open, routeIndex } = props;

  const {
    errors,
    handleBlur,
    handleChange,
    touched,
    values,
  } = useFormikContext<CreateLoadbalancerPayload>();

  const isErrorPresent =
    getIn(errors, `configurations[${configIndex}].routes[${routeIndex}].label`)
      ?.length > 0;

  return (
    <Drawer onClose={handleClose} open={open} title="Edit Route">
      <TextField
        errorText={
          touched.configurations?.[configIndex]?.routes?.[routeIndex]?.label &&
          isErrorPresent
            ? 'Label is required.'
            : ''
        }
        value={
          values?.configurations?.[configIndex]?.routes?.[routeIndex]?.label ||
          ''
        }
        inputId={`route-${routeIndex}-label`}
        label="Route Label"
        name={`configurations[${configIndex}].routes[${routeIndex}].label`}
        onBlur={handleBlur}
        onChange={handleChange}
      />

      <ActionsPanel
        primaryButtonProps={{
          label: 'Save Changes',
          onClick: isErrorPresent ? undefined : handleClose,
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
