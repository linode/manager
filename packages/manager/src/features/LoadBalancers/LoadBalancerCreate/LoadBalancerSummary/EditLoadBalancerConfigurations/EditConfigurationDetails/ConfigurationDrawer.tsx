import Stack from '@mui/material/Stack';
import { getIn, useFormikContext } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Drawer } from 'src/components/Drawer';
import { TextField } from 'src/components/TextField';

import {
  CONFIGURATION_COPY,
  protocolOptions,
} from '../../../../LoadBalancerDetail/Configurations/constants';

import type { LoadBalancerCreateFormData } from '../../../LoadBalancerCreateFormWrapper';

interface Props {
  index: number;
  onClose: () => void;
  open: boolean;
}

export const ConfigurationDrawer = (props: Props) => {
  const { index, onClose: handleClose, open } = props;

  const {
    errors,
    handleBlur,
    handleChange,
    setFieldValue,
    touched,
    values,
  } = useFormikContext<LoadBalancerCreateFormData>();

  const isErrorPresent = (errors?.configurations?.[index] as {
    label: string;
  })?.label;

  return (
    <Drawer
      onClose={handleClose}
      open={open}
      title={`Edit Configuration - ${values.configurations?.[index]?.label} `}
    >
      <TextField
        errorText={
          touched.configurations?.[index]?.label
            ? getIn(errors, `configurations[${index}].label`)
            : ''
        }
        inputId={`configuration-${index}-label`}
        label="Configuration Label"
        name={`configurations[${index}].label`}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="Enter Configuration Label"
        value={values.configurations?.[index]?.label}
      />
      <Stack direction="row" spacing={2}>
        <Autocomplete
          errorText={
            touched.configurations?.[index]?.protocol
              ? getIn(errors, `configurations[${index}].protocol`)
              : ''
          }
          onChange={(_, { value }) =>
            setFieldValue(`configurations[${index}].protocol`, value)
          }
          textFieldProps={{
            labelTooltipText: CONFIGURATION_COPY.Protocol,
          }}
          value={protocolOptions.find(
            (option) =>
              option.value === values.configurations?.[index]?.protocol
          )}
          disableClearable
          label="Protocol"
          options={protocolOptions}
        />
        <TextField
          errorText={
            touched.configurations?.[index]?.port
              ? getIn(errors, `configurations[${index}].port`)
              : ''
          }
          inputId={`configuration-${index}-port`}
          label="Port"
          labelTooltipText={CONFIGURATION_COPY.Port}
          name={`configurations[${index}].port`}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder="Enter Port"
          type="number"
          value={values.configurations?.[index]?.port}
        />
      </Stack>

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
