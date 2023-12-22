import Stack from '@mui/material/Stack';
import { getIn, useFormikContext } from 'formik';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { BetaChip } from 'src/components/BetaChip/BetaChip';
import { Box } from 'src/components/Box';
import { Link } from 'src/components/Link';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { AGLB_DOCS_TLS_CERTIFICATE } from 'src/features/LoadBalancers/constants';

import {
  CONFIGURATION_COPY,
  protocolOptions,
} from '../LoadBalancerDetail/Configurations/constants';

import type { Handlers } from './LoadBalancerConfigurations';
import type { LoadBalancerCreateFormData } from './LoadBalancerCreateFormWrapper';

interface Props {
  handlers: Handlers;
  index: number;
}

export const ConfigurationDetails = ({ index }: Props) => {
  const {
    errors,
    handleBlur,
    handleChange,
    setFieldValue,
    touched,
    values,
  } = useFormikContext<LoadBalancerCreateFormData>();

  return (
    <Box padding={1}>
      <Typography variant="h2">Details</Typography>
      <Typography sx={(theme) => ({ marginRight: theme.spacing(1) })}>
        The port the load balancer listens on, and the protocol for routing
        incoming traffic to the targets.
      </Typography>
      <Stack spacing={2}>
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
        <Stack>
          <Typography variant="h3">
            TLS Certificates
            <TooltipIcon status="help" text={CONFIGURATION_COPY.Certificates} />
          </Typography>
          <Box sx={{ alignItems: 'center', display: 'flex' }}>
            <Typography>
              <BetaChip
                sx={(theme) => ({
                  marginLeft: '0 !important',
                  marginRight: theme.spacing(),
                })}
                component="span"
              />
              After the load balancer is created, and if the protocol is HTTPS,
              upload TLS termination certificates.{' '}
              <Link to={AGLB_DOCS_TLS_CERTIFICATE}>Learn more.</Link>
            </Typography>
          </Box>
        </Stack>
      </Stack>
      <TextField
        errorText={
          touched.configurations?.[index]?.label
            ? getIn(errors, `configurations[${index}].label`)
            : ''
        }
        inputId={`configuration-${index}-label`}
        label="Configuration Label"
        labelTooltipText={CONFIGURATION_COPY.configuration}
        name={`configurations[${index}].label`}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="Enter Configuration Label"
        value={values.configurations?.[index]?.label}
      />
    </Box>
  );
};
