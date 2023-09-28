import { Endpoint, ServiceTargetPayload } from '@linode/api-v4';
import Stack from '@mui/material/Stack';
import { useFormik } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { SelectedIcon } from 'src/components/Autocomplete/Autocomplete.styles';
import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
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
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import { CertificateSelect } from '../Certificates/CertificateSelect';
import { AddEndpointForm } from './AddEndpointForm';
import { EndpointTable } from './EndpointTable';

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
    description: 'Requests are distributed randomly.',
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

const initialValues: ServiceTargetPayload = {
  ca_certificate: '',
  endpoints: [],
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

  const {
    error,
    mutateAsync: createServiceTarget,
    reset,
  } = useServiceTargetCreateMutation(loadbalancerId);

  const formik = useFormik<ServiceTargetPayload>({
    initialValues,
    async onSubmit(values) {
      try {
        await createServiceTarget(values);
        onClose();
      } catch (error) {
        scrollErrorIntoView();
      }
    },
  });

  const onClose = () => {
    formik.resetForm();
    reset();
    _onClose();
  };

  const onAddEndpoint = (endpoint: Endpoint) => {
    formik.setFieldValue('endpoints', [...formik.values.endpoints, endpoint]);
  };

  const onRemoveEndpoint = (index: number) => {
    formik.values.endpoints.splice(index, 1);
    formik.setFieldValue('endpoints', formik.values.endpoints);
  };

  const generalError = error?.find((e) => !e.field)?.reason;

  return (
    <Drawer onClose={onClose} open={open} title="Add a Service Target">
      <form onSubmit={formik.handleSubmit}>
        {generalError && <Notice text={generalError} variant="error" />}
        <TextField
          errorText={error?.find((e) => e.field === 'label')?.reason}
          label="Service Target Label"
          name="label"
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <Autocomplete
          errorText={
            error?.find((e) => e.field === 'load_balancing_policy')?.reason
          }
          onChange={(e, selected) =>
            formik.setFieldValue('load_balancing_policy', selected.value)
          }
          renderOption={(props, option, state) => {
            return (
              <li {...props}>
                <Stack flexGrow={1}>
                  <Typography color="inherit">
                    <b>{option.label}</b>
                  </Typography>
                  <Typography color="inherit">{option.description}</Typography>
                </Stack>
                <SelectedIcon visible={state.selected} />
              </li>
            );
          }}
          value={algorithmOptions.find(
            (option) => option.value === formik.values.load_balancing_policy
          )}
          disableClearable
          label="Algorithm"
          options={algorithmOptions}
        />
        <Divider spacingBottom={24} spacingTop={24} />
        <Typography sx={{ marginBottom: 2 }} variant="h3">
          Endpoints
        </Typography>
        <EndpointTable
          errors={error?.filter((error) =>
            error.field?.startsWith('endpoints')
          )}
          endpoints={formik.values.endpoints}
          onRemove={onRemoveEndpoint}
        />
        <AddEndpointForm onAdd={onAddEndpoint} />
        <Divider spacingBottom={12} spacingTop={24} />
        <Stack alignItems="center" direction="row">
          <Typography variant="h3">Service Target CA Certificate</Typography>
          <TooltipIcon status="help" text="TODO: AGLB" />
        </Stack>
        <CertificateSelect
          onChange={(cert) =>
            formik.setFieldValue('ca_certificate', cert?.label ?? null)
          }
          errorText={error?.find((e) => e.field === 'ca_certificate')?.reason}
          loadbalancerId={loadbalancerId}
          value={(cert) => cert.label === formik.values.ca_certificate}
        />
        <Divider spacingBottom={12} spacingTop={24} />
        <Stack alignItems="center" direction="row">
          <Typography variant="h3">Health Checks</Typography>
          <TooltipIcon status="help" text="TODO: AGLB" />
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
          <Box data-qa-healthcheck-options>
            <RadioGroup
              onChange={(_, value) =>
                formik.setFieldValue('healthcheck.protocol', value)
              }
              sx={{ marginBottom: '0px !important' }}
              value={formik.values.healthcheck.protocol}
            >
              <FormLabel>Protocol</FormLabel>
              <FormControlLabel control={<Radio />} label="HTTP" value="http" />
              <FormControlLabel control={<Radio />} label="TCP" value="tcp" />
              <FormHelperText>
                {error?.find((e) => e.field === 'healthcheck.protocol')?.reason}
              </FormHelperText>
            </RadioGroup>
            <Stack direction="row" spacing={2}>
              <TextField
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">seconds</InputAdornment>
                  ),
                }}
                errorText={
                  error?.find((e) => e.field === 'healthcheck.interval')?.reason
                }
                label="Interval"
                labelTooltipText="TODO: AGLB"
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
                errorText={
                  error?.find(
                    (e) => e.field === 'healthcheck.healthy_threshold'
                  )?.reason
                }
                label="Healthy Threshold"
                labelTooltipText="TODO: AGLB"
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
                errorText={
                  error?.find((e) => e.field === 'healthcheck.timeout')?.reason
                }
                label="Timeout"
                labelTooltipText="TODO: AGLB"
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
                errorText={
                  error?.find(
                    (e) => e.field === 'healthcheck.unhealthy_threshold'
                  )?.reason
                }
                label="Unhealthy Threshold"
                labelTooltipText="TODO: AGLB"
                name="healthcheck.unhealthy_threshold"
                onChange={formik.handleChange}
                type="number"
                value={formik.values.healthcheck.unhealthy_threshold}
              />
            </Stack>
            {formik.values.healthcheck.protocol === 'http' && (
              <>
                <TextField
                  errorText={
                    error?.find((e) => e.field === 'healthcheck.path')?.reason
                  }
                  label="Health Check Path"
                  labelTooltipText="TODO: AGLB"
                  name="healthcheck.path"
                  onChange={formik.handleChange}
                  optional
                  value={formik.values.healthcheck.path}
                />
                <TextField
                  errorText={
                    error?.find((e) => e.field === 'healthcheck.host')?.reason
                  }
                  label="Health Check Host"
                  labelTooltipText="TODO: AGLB"
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
