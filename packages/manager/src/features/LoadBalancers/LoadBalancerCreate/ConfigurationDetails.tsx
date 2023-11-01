import { Grid } from '@mui/material';
import Stack from '@mui/material/Stack';
import * as React from 'react';

import Select from 'src/components/EnhancedSelect/Select';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';

const protocolOptions = [
  { label: 'HTTPS', value: 'https' },
  { label: 'HTTP', value: 'http' },
  { label: 'TCP', value: 'tcp' },
];

export const ConfigurationDetails = () => {
  return (
    <Grid padding={1}>
      <Typography variant="h2">Details</Typography>
      <Typography sx={(theme) => ({ marginRight: theme.spacing(1) })}>
        The port the load balancer listens on, and the protocol for routing
        incoming traffic to the targets.
      </Typography>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Select
            textFieldProps={{
              labelTooltipText: 'TODO',
            }}
            value={
              protocolOptions.find((option) => option.value === '') ?? null
            }
            errorText={''}
            isClearable={false}
            label="Protocol"
            onChange={() => null}
            options={protocolOptions}
            styles={{ container: () => ({ width: 'unset' }) }}
          />
          <TextField
            errorText={''}
            label="Port"
            labelTooltipText="TODO"
            name="port"
            onChange={() => null}
            value={''}
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
        label="Configuration Label"
        name="label"
        onChange={() => null}
        value={''}
      />
    </Grid>
  );
};
