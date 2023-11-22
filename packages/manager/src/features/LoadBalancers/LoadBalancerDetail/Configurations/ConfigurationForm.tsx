import {
  CreateConfigurationSchema,
  UpdateConfigurationSchema,
} from '@linode/validation';
import { useFormik } from 'formik';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import { InputLabel } from 'src/components/InputLabel';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import {
  useLoadBalancerConfigurationCreateMutation,
  useLoadBalancerConfigurationMutation,
} from 'src/queries/aglb/configurations';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';

import { AddRouteDrawer } from '../Routes/AddRouteDrawer';
import { RoutesTable } from '../Routes/RoutesTable';
import { ApplyCertificatesDrawer } from './ApplyCertificatesDrawer';
import { CertificateTable } from './CertificateTable';
import { DeleteConfigurationDialog } from './DeleteConfigurationDialog';
import {
  getConfigurationPayloadFromConfiguration,
  initialValues,
} from './utils';

import type { Configuration, ConfigurationPayload } from '@linode/api-v4';

interface EditProps {
  configuration: Configuration;
  mode: 'edit';
  onCancel?: never;
  onSuccess?: never;
}

interface CreateProps {
  configuration?: never;
  mode: 'create';
  onCancel: () => void;
  onSuccess: (configuration: Configuration) => void;
}

export const ConfigurationForm = (props: CreateProps | EditProps) => {
  const { configuration, mode, onCancel, onSuccess } = props;

  const { loadbalancerId: _loadbalancerId } = useParams<{
    loadbalancerId: string;
  }>();

  const [isApplyCertDialogOpen, setIsApplyCertDialogOpen] = useState(false);
  const [isAddRouteDrawerOpen, setIsAddRouteDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [routesTableQuery, setRoutesTableQuery] = useState('');

  const loadbalancerId = Number(_loadbalancerId);

  const routesTableFilter = routesTableQuery
    ? { label: { '+contains': routesTableQuery } }
    : {};

  const useMutation =
    mode === 'edit'
      ? useLoadBalancerConfigurationMutation
      : useLoadBalancerConfigurationCreateMutation;

  const { error, isLoading, mutateAsync } = useMutation(
    loadbalancerId,
    configuration?.id ?? -1
  );

  const formValues = useMemo(() => {
    if (mode === 'edit') {
      return getConfigurationPayloadFromConfiguration(configuration);
    }
    return initialValues;
  }, [configuration, mode]);

  const validationSchema =
    mode === 'create' ? CreateConfigurationSchema : UpdateConfigurationSchema;

  const formik = useFormik<ConfigurationPayload>({
    enableReinitialize: true,
    initialValues: formValues,
    async onSubmit(values, helpers) {
      try {
        const configuration = await mutateAsync(values);
        if (onSuccess) {
          onSuccess(configuration);
        }
      } catch (error) {
        helpers.setErrors(getFormikErrorsFromAPIErrors(error));
      }
    },
    validationSchema,
  });

  const protocolOptions = [
    { label: 'HTTPS', value: 'https' },
    { label: 'HTTP', value: 'http' },
    { label: 'TCP', value: 'tcp' },
  ];

  const handleRemoveCert = (index: number) => {
    formik.values.certificates.splice(index, 1);
    formik.setFieldValue('certificates', formik.values.certificates);
  };

  const handleRemoveRoute = (index: number) => {
    if (!formik.values.route_ids) {
      return;
    }
    formik.values.route_ids.splice(index, 1);
    formik.setFieldValue('route_ids', formik.values.route_ids);
  };

  const handleAddCerts = (certificates: Configuration['certificates']) => {
    formik.setFieldValue('certificates', [
      ...formik.values.certificates,
      ...certificates,
    ]);
  };

  const generalErrors = error?.reduce((acc, { field, reason }) => {
    if (
      !field ||
      !['certificates', 'label', 'port', 'protocol'].includes(field)
    ) {
      return acc ? `${acc}, ${reason}` : reason;
    }
    return acc;
  }, '');

  return (
    <form onSubmit={formik.handleSubmit}>
      <Typography variant="h2">Details</Typography>
      {generalErrors && (
        <Notice
          spacingBottom={0}
          spacingTop={8}
          text={generalErrors}
          variant="error"
        />
      )}
      <TextField
        errorText={formik.errors.label}
        label="Configuration Label"
        name="label"
        onChange={formik.handleChange}
        value={formik.values.label}
      />
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Autocomplete
            textFieldProps={{
              labelTooltipText: 'TODO: AGLB',
            }}
            value={protocolOptions.find(
              (option) => option.value === formik.values.protocol
            )}
            disableClearable
            errorText={formik.errors.protocol}
            label="Protocol"
            onChange={(e, { value }) => formik.setFieldValue('protocol', value)}
            options={protocolOptions}
          />
          <TextField
            errorText={formik.errors.port}
            label="Port"
            labelTooltipText="TODO: AGLB"
            name="port"
            onChange={formik.handleChange}
            type="number"
            value={formik.values.port}
          />
        </Stack>
        {formik.values.protocol === 'https' && (
          <Stack maxWidth="600px">
            <Stack alignItems="center" direction="row">
              <InputLabel sx={{ marginBottom: 0 }}>TLS Certificates</InputLabel>
              <TooltipIcon status="help" text="TODO: AGLB" />
            </Stack>
            {formik.touched.certificates &&
              typeof formik.errors.certificates === 'string' && (
                <Notice
                  spacingBottom={16}
                  spacingTop={0}
                  text={formik.errors.certificates}
                  variant="error"
                />
              )}
            <CertificateTable
              certificates={formik.values.certificates}
              loadbalancerId={loadbalancerId}
              onRemove={handleRemoveCert}
            />
            <Box mt={2}>
              <Button
                onClick={() => {
                  formik.setFieldTouched('certificates');
                  setIsApplyCertDialogOpen(true);
                }}
                buttonType="outlined"
              >
                Apply {formik.values.certificates.length > 0 ? 'More' : ''}{' '}
                Certificates
              </Button>
            </Box>
          </Stack>
        )}
      </Stack>
      <Divider spacingBottom={16} spacingTop={16} />
      <Stack spacing={2}>
        <Typography variant="h2">Routes</Typography>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          <Button
            buttonType="outlined"
            onClick={() => setIsAddRouteDrawerOpen(true)}
          >
            Add Route
          </Button>
          <TextField
            hideLabel
            label={`Filter ${formik.values.label}'s Routes`}
            onChange={(e) => setRoutesTableQuery(e.target.value)}
            placeholder="Filter"
          />
        </Stack>
        <RoutesTable
          configuredRouteIds={formik.values.route_ids ?? []}
          filter={routesTableFilter}
          onRemove={handleRemoveRoute}
        />
      </Stack>
      <Divider spacingBottom={16} spacingTop={16} />
      <Stack direction="row" flexWrap="wrap" gap={2} justifyContent="flex-end">
        <Button
          onClick={
            mode === 'edit' ? () => setIsDeleteDialogOpen(true) : onCancel
          }
          buttonType="secondary"
        >
          {mode === 'edit' ? 'Delete' : 'Cancel'}
        </Button>
        <Button buttonType="primary" loading={isLoading} type="submit">
          {mode == 'edit' ? 'Save' : 'Create'} Configuration
        </Button>
      </Stack>
      <AddRouteDrawer
        onAdd={(route) => {
          formik.setFieldValue('route_ids', [
            ...(formik.values.route_ids ?? []),
            route,
          ]);
        }}
        configuration={formik.values}
        loadbalancerId={loadbalancerId}
        onClose={() => setIsAddRouteDrawerOpen(false)}
        open={isAddRouteDrawerOpen}
      />
      <ApplyCertificatesDrawer
        loadbalancerId={loadbalancerId}
        onAdd={handleAddCerts}
        onClose={() => setIsApplyCertDialogOpen(false)}
        open={isApplyCertDialogOpen}
      />
      {mode === 'edit' && (
        <DeleteConfigurationDialog
          configuration={configuration}
          loadbalancerId={loadbalancerId}
          onClose={() => setIsDeleteDialogOpen(false)}
          open={isDeleteDialogOpen}
        />
      )}
    </form>
  );
};
