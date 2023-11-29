import { EndpointSchema } from '@linode/validation';
import { useFormik } from 'formik';
import React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { InputAdornment } from 'src/components/InputAdornment';
import { TextField } from 'src/components/TextField';

import { LinodeOrIPSelect } from './LinodeOrIPSelect';
import { SERVICE_TARGET_COPY } from './constants';

import type { Endpoint } from '@linode/api-v4';

const defaultEndpoint: Endpoint = {
  host: '',
  ip: '',
  port: 80,
  rate_capacity: 10_000,
};

interface Props {
  onAdd: (endpoint: Endpoint) => void;
}

export const AddEndpointForm = (props: Props) => {
  const { onAdd } = props;

  const formik = useFormik<Endpoint>({
    initialValues: defaultEndpoint,
    onSubmit(values, helpers) {
      onAdd(values);
      helpers.resetForm();
    },
    validationSchema: EndpointSchema,
  });

  return (
    <>
      <Box>
        <LinodeOrIPSelect
          textFieldProps={{
            labelTooltipText: SERVICE_TARGET_COPY.Tooltips.Endpoints.IP,
          }}
          errorText={formik.errors.ip}
          onChange={(ip) => formik.setFieldValue(`ip`, ip)}
          value={formik.values.ip}
        />
        <TextField
          errorText={formik.errors.port}
          label="Port"
          labelTooltipText={SERVICE_TARGET_COPY.Tooltips.Endpoints.Port}
          name="port"
          onChange={formik.handleChange}
          sx={{ maxWidth: '100px' }}
          type="number"
          value={formik.values.port}
        />
        <TextField
          errorText={formik.errors.host}
          label="Host"
          labelTooltipText={SERVICE_TARGET_COPY.Tooltips.Endpoints.Host}
          name="host"
          onChange={formik.handleChange}
          optional
          value={formik.values.host}
        />
        <TextField
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                Requests per second
              </InputAdornment>
            ),
          }}
          errorText={formik.errors.rate_capacity}
          label="Rate Capacity"
          labelTooltipText={SERVICE_TARGET_COPY.Tooltips.Endpoints.Capacity}
          name="rate_capacity"
          onChange={formik.handleChange}
          sx={{ maxWidth: '275px' }}
          type="number"
          value={formik.values.rate_capacity}
        />
      </Box>
      <Button
        buttonType="outlined"
        onClick={() => formik.handleSubmit()}
        sx={{ marginTop: 2 }}
      >
        Add Endpoint
      </Button>
    </>
  );
};
