import Stack from '@mui/material/Stack';
import { useFormikContext } from 'formik';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';

import type { CreateLoadbalancerPayload } from '@linode/api-v4';

const protocolOptions = [
  { label: 'HTTPS', value: 'https' },
  { label: 'HTTP', value: 'http' },
  { label: 'TCP', value: 'tcp' },
];

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
              labelTooltipText: 'TODO',
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
            labelTooltipText="TODO"
            name={`${name}.${index}.port`}
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="Enter Port"
            value={values[name]?.[index]?.port}
          />
        </Stack>
        <Stack maxWidth="600px">
          <Typography variant="h3">
            TLS Certificates
            <TooltipIcon status="help" text="OMG!" />
          </Typography>
          <Typography>
            Upload and apply downstream Certificate after LB provisioning Learn
            more.
          </Typography>
        </Stack>
      </Stack>
      <TextField
        errorText={
          touched[name]?.[index]?.label ? errors[name]?.[index]?.label : ''
        }
        label="Configuration Label"
        name={`${name}.${index}.label`}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="Enter Configuration Label"
        value={values[name]?.[index]?.label}
      />
    </Box>
  );
};
