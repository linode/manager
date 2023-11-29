import { Grid } from '@mui/material';
import Stack from '@mui/material/Stack';
import { useFormikContext } from 'formik';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';

import type { CreateLoadbalancerPayload } from '@linode/api-v4';

type Configurations = Pick<CreateLoadbalancerPayload, 'configurations'>;

const protocolOptions = [
  { label: 'HTTPS', value: 'https' },
  { label: 'HTTP', value: 'http' },
  { label: 'TCP', value: 'tcp' },
];

interface Props {
  index: number;
}

export const ConfigurationDetails = ({ index }: Props) => {
  const { errors, handleChange, setFieldValue, values } = useFormikContext<{
    configurations: Configurations;
  }>();

  return (
    <Grid padding={1}>
      <Typography variant="h2">Details</Typography>
      <Typography sx={(theme) => ({ marginRight: theme.spacing(1) })}>
        The port the load balancer listens on, and the protocol for routing
        incoming traffic to the targets.
      </Typography>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Autocomplete
            onChange={(_, { value }) =>
              setFieldValue(`configurations.${index}.protocol`, value)
            }
            textFieldProps={{
              labelTooltipText: 'TODO',
            }}
            value={protocolOptions.find(
              (option) => option.value === values.configurations[index].protocol
            )}
            disableClearable
            errorText={errors[`configurations.${index}.protocol`]}
            label="Protocol"
            options={protocolOptions}
          />
          <TextField
            errorText={errors[`configurations.${index}.port`]}
            label="Port"
            labelTooltipText="TODO"
            name={`configurations.${index}.port`}
            onChange={handleChange}
            placeholder="Enter Port"
            value={values.configurations[index].port}
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
        errorText={errors[`configurations.${index}.label`]}
        label="Configuration Label"
        name={`configurations.${index}.label`}
        onChange={handleChange}
        placeholder="Enter Configuration Label"
        value={values.configurations[index].label}
      />
    </Grid>
  );
};
