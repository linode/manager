import { Endpoint, ServiceTargetPayload } from '@linode/api-v4';
import Stack from '@mui/material/Stack';
import { useFormik } from 'formik';
import React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
import Select from 'src/components/EnhancedSelect/Select';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { FormLabel } from 'src/components/FormLabel';
import { InputAdornment } from 'src/components/InputAdornment';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { TextField } from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useServiceTargetCreateMutation } from 'src/queries/aglb/serviceTargets';

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
  const { loadbalancerId, onClose, open } = props;

  const { mutateAsync: createServiceTarget } = useServiceTargetCreateMutation(
    loadbalancerId
  );

  const formik = useFormik<ServiceTargetPayload>({
    initialValues,
    async onSubmit(values) {
      await createServiceTarget(values);
    },
  });

  const onAddAnotherEndpoint = () => {
    formik.setFieldValue('endpoints', [
      ...formik.values.endpoints,
      defaultEndpoint,
    ]);
  };

  return (
    <Drawer onClose={onClose} open={open} title="Add a Service Target">
      <TextField
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
        isClearable={false}
        label="Algorithm"
        options={algorithmOptions}
      />
      <Divider spacingBottom={24} spacingTop={24} />
      <Typography variant="h3">Endpoints</Typography>
      {formik.values.endpoints.map((endpoint, idx) => {
        return (
          <Box key={`endpoint-${idx}`}>
            <Stack direction="row" spacing={2}>
              <TextField
                containerProps={{ flexGrow: 1 }}
                label="Public IP Address"
                labelTooltipText="TODO"
                name={`endpoint[${idx}].ip`}
                onChange={formik.handleChange}
                value={endpoint.ip}
              />
              <TextField
                label="Port"
                labelTooltipText="TODO"
                name={`endpoint[${idx}].port`}
                onChange={formik.handleChange}
                type="number"
                value={endpoint.port}
              />
            </Stack>
            <TextField
              label="Host"
              labelTooltipText="TODO"
              name={`endpoint[${idx}].host`}
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
              label="Capacity"
              labelTooltipText="TODO"
              name={`endpoint[${idx}].capacity`}
              onChange={formik.handleChange}
              type="number"
              value={endpoint.rate_capacity}
            />
          </Box>
        );
      })}
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
          </RadioGroup>
          <Stack direction="row" spacing={2}>
            <TextField
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">seconds</InputAdornment>
                ),
              }}
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
                label="Health Check Path"
                labelTooltipText="TODO"
                name="healthcheck.path"
                onChange={formik.handleChange}
                optional
                value={formik.values.healthcheck.path}
              />
              <TextField
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
    </Drawer>
  );
};
