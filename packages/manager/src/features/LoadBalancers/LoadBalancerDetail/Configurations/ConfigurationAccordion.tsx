import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Accordion } from 'src/components/Accordion';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import { InputLabel } from 'src/components/InputLabel';
import { Stack } from 'src/components/Stack';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerConfigurationMutation } from 'src/queries/aglb/configurations';
import { getErrorMap } from 'src/utilities/errorUtils';
import { pluralize } from 'src/utilities/pluralize';

import { AddRouteDrawer } from '../Routes/AddRouteDrawer';
import { RoutesTable } from '../Routes/RoutesTable';
import { ApplyCertificatesDrawer } from './ApplyCertificatesDrawer';
import { CertificateTable } from './CertificateTable';
import { DeleteConfigurationDialog } from './DeleteConfigurationDialog';

import type { Configuration } from '@linode/api-v4';

interface Props {
  configuration: Configuration;
  loadbalancerId: number;
}

function getConfigurationPayloadFromConfiguration(
  configuration: Configuration
) {
  return {
    certificates: configuration.certificates,
    label: configuration.label,
    port: configuration.port,
    protocol: configuration.protocol,
    routes: configuration.routes.map((r) => r.id),
  };
}

export const ConfigurationAccordion = (props: Props) => {
  const { configuration, loadbalancerId } = props;
  const [isApplyCertDialogOpen, setIsApplyCertDialogOpen] = useState(false);
  const [isAddRouteDrawerOpen, setIsAddRouteDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [routesTableQuery, setRoutesTableQuery] = useState('');

  const routesTableFilter = routesTableQuery
    ? { label: { '+contains': routesTableQuery } }
    : {};

  const {
    error,
    isLoading,
    mutateAsync,
  } = useLoadBalancerConfigurationMutation(loadbalancerId, configuration.id);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getConfigurationPayloadFromConfiguration(configuration),
    onSubmit(values) {
      mutateAsync(values);
    },
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

  const handleAddCerts = (certificates: Configuration['certificates']) => {
    formik.setFieldValue('certificates', [
      ...formik.values.certificates,
      ...certificates,
    ]);
  };

  const errorMap = getErrorMap(['protocol', 'port', 'label'], error);

  return (
    <Accordion
      heading={
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          gap={1}
          justifyContent="space-between"
          pr={2}
        >
          <Stack alignItems="center" direction="row" spacing={1}>
            <Typography variant="h3">{configuration.label}</Typography>
            <Typography>&mdash;</Typography>
            <Typography fontSize="1rem">
              Port {configuration.port} -{' '}
              {pluralize('Route', 'Routes', configuration.routes.length)}
            </Typography>
          </Stack>
          {/* @TODO Hook up endpoint status */}
          <Stack direction="row" spacing={2}>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Typography>Endpoints:</Typography>
              <StatusIcon status="active" />
              <Typography>4 up</Typography>
              <Typography>&mdash;</Typography>
              <StatusIcon status="error" />
              <Typography>6 down</Typography>
            </Stack>
            <Box>
              <Typography>ID: {configuration.id}</Typography>
            </Box>
          </Stack>
        </Stack>
      }
      headingProps={{ sx: { width: '100%' } }}
    >
      <form onSubmit={formik.handleSubmit}>
        <Typography variant="h2">Details</Typography>
        <TextField
          label="Configuration Label"
          name="label"
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <Autocomplete
              onChange={(e, { value }) =>
                formik.setFieldValue('protocol', value)
              }
              textFieldProps={{
                labelTooltipText: 'TODO',
              }}
              value={protocolOptions.find(
                (option) => option.value === formik.values.protocol
              )}
              disableClearable
              errorText={errorMap.protocol}
              label="Protocol"
              options={protocolOptions}
            />
            <TextField
              errorText={errorMap.port}
              label="Port"
              labelTooltipText="TODO"
              name="port"
              onChange={formik.handleChange}
              value={formik.values.port}
            />
          </Stack>
          <Stack maxWidth="600px">
            <Stack alignItems="center" direction="row">
              <InputLabel sx={{ marginBottom: 0 }}>TLS Certificates</InputLabel>
              <TooltipIcon status="help" text="TODO: AGLB" />
            </Stack>
            <CertificateTable
              certificates={formik.values.certificates}
              loadbalancerId={loadbalancerId}
              onRemove={handleRemoveCert}
            />
            <Box mt={2}>
              <Button
                buttonType="outlined"
                onClick={() => setIsApplyCertDialogOpen(true)}
              >
                Apply {formik.values.certificates.length > 0 ? 'More' : ''}{' '}
                Certificates
              </Button>
            </Box>
          </Stack>
        </Stack>
        <Divider spacingBottom={16} spacingTop={16} />
        <Stack spacing={2}>
          <Typography variant="h2">Routes</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              buttonType="outlined"
              onClick={() => setIsAddRouteDrawerOpen(true)}
            >
              Add Route
            </Button>
            <TextField
              hideLabel
              label={`Filter ${configuration.label}'s Routes`}
              onChange={(e) => setRoutesTableQuery(e.target.value)}
              placeholder="Filter"
              sx={{ minWidth: 300 }}
            />
          </Stack>
          <RoutesTable
            configuredRoutes={configuration.routes}
            filter={routesTableFilter}
          />
        </Stack>
        <Divider spacingBottom={16} spacingTop={16} />
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button
            buttonType="secondary"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete Configuration
          </Button>
          <Button
            buttonType="primary"
            disabled={!formik.dirty}
            loading={isLoading}
            type="submit"
          >
            Save Configuration
          </Button>
        </Stack>
        <AddRouteDrawer
          onAdd={(route) => {
            formik.setFieldValue('routes', [...formik.values.routes, route]);
          }}
          configuration={configuration}
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
        <DeleteConfigurationDialog
          configuration={configuration}
          loadbalancerId={loadbalancerId}
          onClose={() => setIsDeleteDialogOpen(false)}
          open={isDeleteDialogOpen}
        />
      </form>
    </Accordion>
  );
};
