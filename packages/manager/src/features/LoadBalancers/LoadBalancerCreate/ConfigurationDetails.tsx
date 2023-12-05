import Stack from '@mui/material/Stack';
import { useFormikContext } from 'formik';
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

import type { CreateLoadbalancerPayload } from '@linode/api-v4';

interface Props {
  index: number;
  name: string;
}

export const ConfigurationDetails = ({ index, name }: Props) => {
  const {
    errors,
    handleBlur,
    handleChange,
    setFieldValue,
    touched,
    values,
  } = useFormikContext<CreateLoadbalancerPayload>();

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
              touched[name]?.[index]?.protocol
                ? errors[name]?.[index]?.protocol
                : ''
            }
            onChange={(_, { value }) =>
              setFieldValue(`${name}.${index}.protocol`, value)
            }
            textFieldProps={{
              labelTooltipText: CONFIGURATION_COPY.Protocol,
            }}
            value={protocolOptions.find(
              (option) => option.value === values[name]?.[index]?.protocol
            )}
            disableClearable
            label="Protocol"
            options={protocolOptions}
          />
          <TextField
            errorText={
              touched[name]?.[index]?.port ? errors[name]?.[index]?.port : ''
            }
            label="Port"
            labelTooltipText={CONFIGURATION_COPY.Port}
            name={`${name}.${index}.port`}
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="Enter Port"
            type="number"
            value={values[name]?.[index]?.port}
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
          touched[name]?.[index]?.label ? errors[name]?.[index]?.label : ''
        }
        label="Configuration Label"
        labelTooltipText={CONFIGURATION_COPY.configuration}
        name={`${name}.${index}.label`}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="Enter Configuration Label"
        value={values[name]?.[index]?.label}
      />
    </Box>
  );
};
