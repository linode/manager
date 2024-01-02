import { Endpoint, ServiceTargetPayload } from '@linode/api-v4';
import { UpdateServiceTargetSchema } from '@linode/validation';
import { useFormik, useFormikContext, yupToFormErrors } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { SelectedIcon } from 'src/components/Autocomplete/Autocomplete.styles';
import { BetaChip } from 'src/components/BetaChip/BetaChip';
import { Divider } from 'src/components/Divider';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { FormHelperText } from 'src/components/FormHelperText';
import { FormLabel } from 'src/components/FormLabel';
import { InputAdornment } from 'src/components/InputAdornment';
import { Link } from 'src/components/Link';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';

import { AddEndpointForm } from '../LoadBalancerDetail/ServiceTargets/AddEndpointForm';
import { EndpointTable } from '../LoadBalancerDetail/ServiceTargets/EndpointTable';
import {
  SERVICE_TARGET_COPY,
  algorithmOptions,
  initialValues,
  protocolOptions,
} from '../LoadBalancerDetail/ServiceTargets/constants';
import { AGLB_DOCS } from '../constants';
import { LoadBalancerCreateFormData } from './LoadBalancerCreate';

interface Props {
  configurationIndex: number;
  onClose: () => void;
  serviceTargetIndex: number | undefined;
}

/**
 * A Drawer to add Service Targets on the Load Balancer Create Page.
 */
export const ServiceTargetForm = (props: Props) => {
  const { configurationIndex, onClose: _onClose, serviceTargetIndex } = props;

  const isEditMode = serviceTargetIndex !== undefined;

  const {
    setFieldValue,
    values,
  } = useFormikContext<LoadBalancerCreateFormData>();

  const configuration = values.configurations[configurationIndex];

  const formik = useFormik<ServiceTargetPayload>({
    enableReinitialize: true,
    initialValues: isEditMode
      ? configuration.service_targets[serviceTargetIndex]
      : initialValues,
    async onSubmit(serviceTarget) {
      if (isEditMode) {
        configuration.service_targets[serviceTargetIndex] = serviceTarget;
        setFieldValue(
          `configurations[${configurationIndex}]service_targets`,
          configuration.service_targets
        );
      } else {
        setFieldValue(`configurations[${configurationIndex}]service_targets`, [
          ...configuration.service_targets,
          serviceTarget,
        ]);
      }
      onClose();
    },
    validate(serviceTarget) {
      const allServiceTargets = values.configurations.reduce<
        ServiceTargetPayload[]
      >((acc, configurations, configIndex) => {
        const otherServiceTargets = configurations.service_targets.filter(
          (st, stIndex) => {
            if (
              isEditMode &&
              configIndex === configurationIndex &&
              stIndex === serviceTargetIndex
            ) {
              return false;
            }
            return true;
          }
        );
        return [...acc, ...otherServiceTargets];
      }, []);
      if (allServiceTargets.some((st) => st.label === serviceTarget.label)) {
        return { label: 'Label must be unique across all configurations.' };
      }
      // We must use `validate` instead of validationSchema because Formik decided to convert
      // "" to undefined before passing the values to yup. This makes it hard to validate `label`.
      // See https://github.com/jaredpalmer/formik/issues/805
      try {
        UpdateServiceTargetSchema.validateSync(serviceTarget, {
          abortEarly: false,
        });
        return {};
      } catch (error) {
        return yupToFormErrors(error);
      }
    },
  });

  const onClose = () => {
    formik.resetForm();
    _onClose();
  };

  const onAddEndpoint = (endpoint: Endpoint) => {
    formik.setFieldValue('endpoints', [...formik.values.endpoints, endpoint]);
  };

  const onRemoveEndpoint = (index: number) => {
    formik.setFieldValue(
      'endpoints',
      formik.values.endpoints.filter((_, idx) => idx !== index)
    );
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <TextField
        errorText={formik.touched.label ? formik.errors.label : undefined}
        label="Service Target Label"
        name="label"
        noMarginTop={!isEditMode}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.label}
      />
      <Autocomplete
        textFieldProps={{
          labelTooltipText: SERVICE_TARGET_COPY.Tooltips.Protocol,
        }}
        value={protocolOptions.find(
          (option) => option.value === formik.values.protocol
        )}
        disableClearable
        errorText={formik.errors.protocol}
        label="Service Target Protocol"
        onChange={(_, { value }) => formik.setFieldValue('protocol', value)}
        options={protocolOptions}
      />
      <Autocomplete
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
        textFieldProps={{
          labelTooltipText: SERVICE_TARGET_COPY.Tooltips.Algorithm,
        }}
        value={algorithmOptions.find(
          (option) => option.value === formik.values.load_balancing_policy
        )}
        disableClearable
        errorText={formik.errors.load_balancing_policy}
        label="Algorithm"
        options={algorithmOptions}
      />
      <Divider spacingBottom={24} spacingTop={24} />
      <Typography sx={{ marginBottom: 2 }} variant="h3">
        Endpoints
      </Typography>
      <EndpointTable
        endpoints={formik.values.endpoints}
        onRemove={onRemoveEndpoint}
      />
      <AddEndpointForm onAdd={onAddEndpoint} />
      {formik.values.protocol === 'https' && (
        <>
          <Divider spacingBottom={12} spacingTop={24} />
          <Stack alignItems="center" direction="row">
            <Typography variant="h3">Service Target CA Certificate</Typography>
            <TooltipIcon
              status="help"
              text={SERVICE_TARGET_COPY.Tooltips.Certificate}
            />
          </Stack>
          <Typography>
            <BetaChip
              component="span"
              sx={{ marginLeft: '0 !important', marginRight: '4px' }}
            />
            Upload service target endpoint CA certificates after the load
            balancer is created and the protocol is HTTPS.{' '}
            <Link to={AGLB_DOCS.Certificates}>Learn more.</Link>
          </Typography>
        </>
      )}
      <Divider spacingBottom={12} spacingTop={24} />
      <Stack alignItems="center" direction="row">
        <Typography variant="h3">Health Checks</Typography>
        <TooltipIcon
          status="help"
          text={SERVICE_TARGET_COPY.Tooltips.Healthcheck.Description}
        />
      </Stack>
      <RadioGroup
        onChange={(_, value) =>
          formik.setFieldValue('healthcheck.protocol', value)
        }
        sx={{ marginBottom: '0px !important' }}
        value={formik.values.healthcheck.protocol}
      >
        <FormLabel>
          Protocol
          <TooltipIcon
            status="help"
            sxTooltipIcon={{ marginLeft: 1.5, padding: 0 }}
            text={SERVICE_TARGET_COPY.Tooltips.Healthcheck.Protocol}
          />
        </FormLabel>
        <FormControlLabel control={<Radio />} label="HTTP" value="http" />
        <FormControlLabel control={<Radio />} label="TCP" value="tcp" />
        <FormHelperText>{formik.errors.healthcheck?.protocol}</FormHelperText>
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
          labelTooltipText={SERVICE_TARGET_COPY.Tooltips.Healthcheck.Interval}
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
          labelTooltipText={SERVICE_TARGET_COPY.Tooltips.Healthcheck.Healthy}
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
          labelTooltipText={SERVICE_TARGET_COPY.Tooltips.Healthcheck.Timeout}
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
          labelTooltipText={SERVICE_TARGET_COPY.Tooltips.Healthcheck.Unhealthy}
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
              formik.touched.healthcheck?.path
                ? formik.errors.healthcheck?.path
                : undefined
            }
            label="Health Check Path"
            labelTooltipText={SERVICE_TARGET_COPY.Tooltips.Healthcheck.Path}
            name="healthcheck.path"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            optional
            placeholder="/"
            value={formik.values.healthcheck.path}
          />
          <TextField
            errorText={
              formik.touched.healthcheck?.host
                ? formik.errors.healthcheck?.host
                : undefined
            }
            label="Health Check Host"
            labelTooltipText={SERVICE_TARGET_COPY.Tooltips.Healthcheck.Host}
            name="healthcheck.host"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            placeholder="example.org"
            value={formik.values.healthcheck.host}
          />
        </>
      )}
      <ActionsPanel
        primaryButtonProps={{
          disabled: isEditMode && !formik.dirty,
          label: isEditMode ? 'Save' : 'Add Service Target',
          type: 'submit',
        }}
        secondaryButtonProps={{
          label: 'Cancel',
          onClick: onClose,
        }}
      />
    </form>
  );
};
