import { Endpoint, ServiceTargetPayload } from '@linode/api-v4';
import { CreateServiceTargetSchema } from '@linode/validation';
import Stack from '@mui/material/Stack';
import { useFormik } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
import Select from 'src/components/EnhancedSelect/Select';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { FormHelperText } from 'src/components/FormHelperText';
import { FormLabel } from 'src/components/FormLabel';
import { InputAdornment } from 'src/components/InputAdornment';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { TextField } from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useServiceTargetCreateMutation } from 'src/queries/aglb/serviceTargets';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';

import { CertificateSelect } from '../Certificates/CertificateSelect';

interface Props {
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
}

const algorithmOptions = [
  {
    description: 'Sequential routing to each instance.',
    label: 'Round Robin',
    value: 'round_robin',
  },
  {
    description:
      'Sends requests to the target with the least amount of current connections.',
    label: 'Least Request',
    value: 'least_request',
  },
  {
    description: 'Reads the request hash value and routes accordingly.',
    label: 'Ring Hash',
    value: 'ring_hash',
  },
  {
    description: 'Request are distributed randomly.',
    label: 'Random',
    value: 'random',
  },
  {
    description:
      'Reads the upstream hash to make content aware routing decisions.',
    label: 'Maglev',
    value: 'maglev',
  },
];

const defaultEndpoint: Endpoint = {
  host: '',
  ip: '',
  port: 80,
  rate_capacity: 10_000,
};

const initialValues: ServiceTargetPayload = {
  ca_certificate: '',
  endpoints: [defaultEndpoint],
  healthcheck: {
    healthy_threshold: 3,
    host: '',
    interval: 10,
    path: '',
    protocol: 'http',
    timeout: 5,
    unhealthy_threshold: 3,
  },
  label: '',
  load_balancing_policy: 'round_robin',
};

export const CreateServiceTargetDrawer = (props: Props) => {
  const { loadbalancerId, onClose: _onClose, open } = props;

  const { mutateAsync: createServiceTarget } = useServiceTargetCreateMutation(
    loadbalancerId
  );

  const formik = useFormik<ServiceTargetPayload>({
    initialValues,
    async onSubmit(values) {
      try {
        await createServiceTarget(values);
        onClose();
      } catch (error) {
        // @TODO fix api error handling
        handleAPIErrors(error, formik.setFieldError, formik.setStatus);
      }
    },
    validateOnChange: false,
    validationSchema: CreateServiceTargetSchema,
  });

  const onClose = () => {
    formik.resetForm();
    _onClose();
  };

  const onAddAnotherEndpoint = () => {
    formik.setFieldValue('endpoints', [
      ...formik.values.endpoints,
      defaultEndpoint,
    ]);
  };

  return (
    <Drawer onClose={onClose} open={open} title="Add a Service Target">
      <form onSubmit={formik.handleSubmit}>
        {formik.status && <Notice text={formik.status} variant="error" />}
        <TextField
          errorText={formik.errors.label}
          label="Service Target Label"
          name="label"
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <Select
          formatOptionLabel={(option, meta) => {
            if (meta.context === 'value') {
              return option.label;
            }
            return (
              <>
                <Typography>
                  <b>{option.label}</b>
                </Typography>
                <Typography>{option.description}</Typography>
              </>
            );
          }}
          onChange={(selected) =>
            formik.setFieldValue('load_balancing_policy', selected.value)
          }
          textFieldProps={{
            labelTooltipText: 'TODO',
          }}
          value={algorithmOptions.find(
            (option) => option.value === formik.values.load_balancing_policy
          )}
          errorText={formik.errors.load_balancing_policy}
          isClearable={false}
          label="Algorithm"
          options={algorithmOptions}
        />
        <Divider spacingBottom={24} spacingTop={24} />
        <Typography variant="h3">Endpoints</Typography>
        {formik.values.endpoints.map((endpoint, idx) => (
          <Box key={`endpoint-${idx}`}>
            <Stack direction="row" spacing={2}>
              <TextField
                containerProps={{ flexGrow: 1 }}
                errorText={formik.errors.endpoints?.[idx]?.['ip']}
                label="Public IP Address"
                labelTooltipText="TODO"
                name={`endpoints[${idx}].ip`}
                onChange={formik.handleChange}
                value={endpoint.ip}
              />
              <TextField
                errorText={formik.errors.endpoints?.[idx]?.['port']}
                label="Port"
                labelTooltipText="TODO"
                name={`endpoints[${idx}].port`}
                onChange={formik.handleChange}
                type="number"
                value={endpoint.port}
              />
            </Stack>
            <TextField
              errorText={formik.errors.endpoints?.[idx]?.['host']}
              label="Host"
              labelTooltipText="TODO"
              name={`endpoints[${idx}].host`}
              onChange={formik.handleChange}
              optional
              type="number"
              value={endpoint.host}
            />
            <TextField
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    Requests per second
                  </InputAdornment>
                ),
              }}
              errorText={formik.errors.endpoints?.[idx]?.['capacity']}
              label="Capacity"
              labelTooltipText="TODO"
              name={`endpoints[${idx}].capacity`}
              onChange={formik.handleChange}
              type="number"
              value={endpoint.rate_capacity}
            />
          </Box>
        ))}
        <Button
          buttonType="outlined"
          onClick={onAddAnotherEndpoint}
          sx={{ marginTop: 2 }}
        >
          Add Another Endpoint
        </Button>
        <Divider spacingBottom={12} spacingTop={24} />
        <Stack alignItems="center" direction="row">
          <Typography variant="h3">Service Target CA Certificate</Typography>
          <TooltipIcon status="help" text="TODO" />
        </Stack>
        <CertificateSelect
          errorText={formik.errors.ca_certificate}
          loadbalancerId={loadbalancerId}
          onChange={() => null}
          value={0}
        />
        <Divider spacingBottom={12} spacingTop={24} />
        <Stack alignItems="center" direction="row">
          <Typography variant="h3">Health Checks</Typography>
          <TooltipIcon status="help" text="TODO" />
        </Stack>
        <FormControlLabel
          control={
            <Toggle
              onChange={(_, checked) =>
                formik.setFieldValue('healthcheck.interval', checked ? 10 : 0)
              }
              checked={formik.values.healthcheck.interval !== 0}
            />
          }
          label="Use Health Checks"
        />
        {formik.values.healthcheck.interval !== 0 && (
          <Box>
            <RadioGroup
              onChange={(_, value) =>
                formik.setFieldValue('healthcheck.protocol', value)
              }
              value={formik.values.healthcheck.protocol}
            >
              <FormLabel>Protocol</FormLabel>
              <FormControlLabel control={<Radio />} label="HTTP" value="http" />
              <FormControlLabel control={<Radio />} label="TCP" value="tcp" />
              <FormHelperText>
                {formik.errors.healthcheck?.protocol}
              </FormHelperText>
            </RadioGroup>
            <Stack direction="row" spacing={2}>
              <TextField
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">seconds</InputAdornment>
                  ),
                }}
                errorText={formik.errors.healthcheck?.interval}
                label="Interval"
                labelTooltipText="TODO"
                name="healthcheck.interval"
                onChange={formik.handleChange}
                type="number"
                value={formik.values.healthcheck.interval}
              />
              <TextField
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">checks</InputAdornment>
                  ),
                }}
                errorText={formik.errors.healthcheck?.healthy_threshold}
                label="Healthy Threshold"
                labelTooltipText="TODO"
                name="healthcheck.healthy_threshold"
                onChange={formik.handleChange}
                type="number"
                value={formik.values.healthcheck.healthy_threshold}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">seconds</InputAdornment>
                  ),
                }}
                errorText={formik.errors.healthcheck?.timeout}
                label="Timeout"
                labelTooltipText="TODO"
                name="healthcheck.timeout"
                onChange={formik.handleChange}
                type="number"
                value={formik.values.healthcheck.timeout}
              />
              <TextField
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">checks</InputAdornment>
                  ),
                }}
                errorText={formik.errors.healthcheck?.unhealthy_threshold}
                label="Unhealthy Threshold"
                labelTooltipText="TODO"
                name="healthcheck.unhealthy_threshold"
                onChange={formik.handleChange}
                type="number"
                value={formik.values.healthcheck.unhealthy_threshold}
              />
            </Stack>
            {formik.values.healthcheck.protocol === 'http' && (
              <>
                <TextField
                  errorText={formik.errors.healthcheck?.path}
                  label="Health Check Path"
                  labelTooltipText="TODO"
                  name="healthcheck.path"
                  onChange={formik.handleChange}
                  optional
                  value={formik.values.healthcheck.path}
                />
                <TextField
                  errorText={formik.errors.healthcheck?.host}
                  label="Health Check Host"
                  labelTooltipText="TODO"
                  name="healthcheck.host"
                  onChange={formik.handleChange}
                  optional
                  value={formik.values.healthcheck.host}
                />
              </>
            )}
          </Box>
        )}
        <ActionsPanel
          primaryButtonProps={{
            label: 'Create Service Target',
            loading: formik.isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </form>
    </Drawer>
  );
};
